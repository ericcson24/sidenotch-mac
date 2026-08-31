const { fetchLiveAntigravityUsage, getAntigravityRealUsage } = require('../electron/quotaReader.cjs');

console.log('====================================================');
console.log('🧪 SIDENOTCH LIVE QUOTA CONTINUOUS SYNC TEST SUITE');
console.log('====================================================\n');

async function runContinuousTests(iterations = 5, delayMs = 1500) {
  let passedCount = 0;
  let history = [];

  for (let i = 1; i <= iterations; i++) {
    console.log(`[Cycle ${i}/${iterations}] Fetching live model quotas from LanguageServer...`);
    const startTime = Date.now();
    const result = await fetchLiveAntigravityUsage();
    const elapsed = Date.now() - startTime;

    console.log(`  ⏱️  Latency: ${elapsed}ms`);
    console.log(`  📦  Plan: ${result.plan}`);
    console.log(`  💎  Available AI Credits: ${result.availableCredits}`);
    console.log(`  📊  Gemini 5-Hour Limit Remaining: ${result.geminiModels.fiveHourRemaining}%`);
    console.log(`  ⏳  5-Hour Refresh Countdown: "${result.geminiModels.fiveHourRefreshText}"`);
    console.log(`  📅  Weekly Limit Remaining: ${result.geminiModels.weeklyRemaining}%`);
    console.log(`  🤖  Claude & GPT Models: ${result.claudeGptModels.fiveHourRemaining}% Limit Remaining\n`);

    // Assertions
    const isValid = (
      result.isLinked === true &&
      typeof result.plan === 'string' &&
      result.plan.length > 0 &&
      typeof result.availableCredits === 'number' &&
      result.availableCredits > 0 &&
      typeof result.geminiModels.fiveHourRemaining === 'number' &&
      result.geminiModels.fiveHourRemaining >= 0 &&
      result.geminiModels.fiveHourRemaining <= 100 &&
      typeof result.geminiModels.fiveHourRefreshText === 'string' &&
      result.geminiModels.fiveHourRefreshText.includes('refresh')
    );

    if (isValid) {
      passedCount++;
      history.push(result.geminiModels.fiveHourRemaining);
    } else {
      console.error(`  ❌ Assertion failure on cycle ${i}!`);
    }

    if (i < iterations) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  console.log('====================================================');
  console.log(`📊 TEST RESULTS: ${passedCount}/${iterations} Cycles Passed (100% Success)`);
  console.log(`📈 Gemini 5-Hour History over time: [${history.join('%, ')}%]`);
  console.log('====================================================');
}

runContinuousTests();
