async function openPage(url) {
  const target = await fetch(
    `http://127.0.0.1:9222/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  ).then((res) => res.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const command = (method, params = {}) => {
    const id = ++sequence;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  };
  const evaluate = async (expression) => {
    const result = await command('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    });
    return result.result.value;
  };
  const waitUntil = async (predicate, timeoutMs = 6000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      try {
        if (await predicate()) return true;
      } catch {
        // Navigation can invalidate an in-flight Runtime.evaluate; retry.
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return false;
  };
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Page.navigate', { url });
  return {
    evaluate,
    waitUntil,
    async close() {
      socket.close();
      await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
    },
  };
}

const intentLabels = [
  '今すぐラクしたい',
  'お金の損を減らしたい',
  '知らないと損する制度',
  '仕事で消耗したくない',
  '親・将来の不安',
];

const page = await openPage(`http://127.0.0.1:3000/?smoke=${Date.now()}`);
await page.waitUntil(() => page.evaluate(
  `${JSON.stringify(intentLabels)}.every((label) =>
    [...document.querySelectorAll('button')].some((item) => item.textContent.trim() === label))`,
));
const firstView = await page.evaluate(`(() => {
  const fields = [...document.querySelectorAll('input, textarea')]
    .filter((item) => {
      const rect = item.getBoundingClientRect();
      const style = getComputedStyle(item);
      return rect.bottom > 0 && rect.top < innerHeight
        && style.display !== 'none' && style.visibility !== 'hidden';
    })
    .map((item) => ({
      tag: item.tagName,
      placeholder: item.getAttribute('placeholder') || '',
      ariaLabel: item.getAttribute('aria-label') || '',
    }));
  const aiPattern = /AI|相談|悩み|状況/i;
  return {
    headingVisible: document.body.innerText.includes('知らなきゃ損する、日本の実用ワザ'),
    visibleIntentCount: ${JSON.stringify(intentLabels)}
      .filter((label) => document.body.innerText.includes(label)).length,
    aiInputFields: fields.filter((item) =>
      item.tag === 'TEXTAREA' || aiPattern.test(item.placeholder + item.ariaLabel)),
  };
})()`);

const discoveryFlow = await page.evaluate(`(() => {
  const texts = [...document.querySelectorAll('button')].map((item) => item.textContent.trim());
  const intent = [...document.querySelectorAll('button')]
    .find((item) => item.textContent.trim() === '今すぐラクしたい');
  intent?.click();
  return {
    intentClicked: Boolean(intent),
    hasSwitchIntent: texts.includes('別の切り口を見る'),
    hasExploreMore: texts.some((text) => text.includes('もっと探す')),
  };
})()`);
await page.waitUntil(() => page.evaluate(
  `[...document.querySelectorAll('span')]
    .filter((item) => item.textContent.trim() === '手順を見る →').length >= 3`,
));
discoveryFlow.cardCount = await page.evaluate(
  `[...document.querySelectorAll('span')]
    .filter((item) => item.textContent.trim() === '手順を見る →').length`,
);
await page.evaluate(`(() => {
  document.querySelector('button[title="保存解除"]')?.click();
})()`);
await page.waitUntil(() => page.evaluate(
  `Boolean(document.querySelector('button[title="保存する"]'))`,
));
discoveryFlow.saveClicked = await page.evaluate(`(() => {
  const button = document.querySelector('button[title="保存する"]');
  button?.click();
  return Boolean(button);
})()`);
await page.waitUntil(() => page.evaluate(
  `Boolean(document.querySelector('button[title="保存解除"]'))`,
));
discoveryFlow.saved = await page.evaluate(
  `Boolean(document.querySelector('button[title="保存解除"]'))`,
);
discoveryFlow.detailClicked = await page.evaluate(`(() => {
  const card = document.querySelector('div.group');
  card?.click();
  return Boolean(card);
})()`);
await page.waitUntil(() => page.evaluate(
  `document.body.innerText.includes('知ってたら、もっと早く楽になってたかも')`,
));
discoveryFlow.modalOpened = await page.evaluate(
  `document.body.innerText.includes('知ってたら、もっと早く楽になってたかも')`,
);
await page.evaluate(`(() => {
  [...document.querySelectorAll('button')]
    .find((item) => item.textContent.trim() === '✕')?.click();
})()`);
await page.waitUntil(() => page.evaluate(
  `!document.body.innerText.includes('知ってたら、もっと早く楽になってたかも')`,
));
const consultSheet = {};
consultSheet.opened = await page.evaluate(`(() => {
  const button = [...document.querySelectorAll('button')]
    .find((item) => item.textContent.includes('あなたの条件で試算・確認する'));
  button?.click();
  return Boolean(button);
})()`);
await page.waitUntil(() => page.evaluate(
  `Boolean(document.querySelector('input[placeholder*="年収500万"]'))`,
));
consultSheet.inputVisible = await page.evaluate(
  `Boolean(document.querySelector('input[placeholder*="年収500万"]'))`,
);
consultSheet.freeLimitVisible = await page.evaluate(
  `document.body.innerText.includes('月3回無料（残3回）')`,
);
await page.close();

const legalPages = [];
for (const [buttonText, requiredText] of [
  ['利用規約', '第1条（サービス内容）'],
  ['プライバシー', 'Gemini API'],
  ['特商法', 'Proプラン ¥680/月'],
]) {
  const legal = await openPage(`http://127.0.0.1:3000/?legal=${encodeURIComponent(buttonText)}`);
  await legal.waitUntil(() => legal.evaluate(
    `[...document.querySelectorAll('button')]
      .some((item) => item.textContent.trim() === ${JSON.stringify(buttonText)})`,
  ));
  await new Promise((resolve) => setTimeout(resolve, 200));
  const clicked = await legal.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')]
      .find((item) => item.textContent.trim() === ${JSON.stringify(buttonText)});
    button?.click();
    return Boolean(button);
  })()`);
  await legal.waitUntil(() => legal.evaluate(
    `document.body.innerText.includes(${JSON.stringify(requiredText)})
      && document.body.innerText.includes('トップに戻る')`,
  ));
  const rendered = await legal.evaluate(
    `document.body.innerText.includes(${JSON.stringify(requiredText)})`,
  );
  const backClicked = await legal.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')]
      .find((item) => item.textContent.includes('トップに戻る'));
    button?.click();
    return Boolean(button);
  })()`);
  legalPages.push({ buttonText, clicked, rendered, backClicked });
  await legal.close();
}

const result = { firstView, discoveryFlow, consultSheet, legalPages };
console.log(JSON.stringify(result, null, 2));
if (!firstView.headingVisible || firstView.visibleIntentCount !== 5
  || firstView.aiInputFields.length
  || !discoveryFlow.intentClicked || !discoveryFlow.hasSwitchIntent
  || !discoveryFlow.hasExploreMore
  || discoveryFlow.cardCount < 3 || discoveryFlow.cardCount > 6
  || !discoveryFlow.saveClicked || !discoveryFlow.saved
  || !discoveryFlow.detailClicked || !discoveryFlow.modalOpened
  || !consultSheet.opened || !consultSheet.inputVisible || !consultSheet.freeLimitVisible
  || legalPages.some((item) => !item.clicked || !item.rendered || !item.backClicked)) {
  process.exitCode = 1;
}
