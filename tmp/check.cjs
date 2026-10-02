const {chromium}=require('C:/Users/tania/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:"msedge"});const page=await browser.newPage({viewport:{width:1440,height:1050}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///C:/Users/tania/Documents/2026_2/Metodos%20Numericos/Met%20NUM%203/index.html');
 assert.strictEqual(await page.locator('#result').innerText(),'55.25');
 await page.screenshot({path:'tmp/desktop.png',fullPage:true});
 await page.locator('.node-x').nth(1).fill('2');await page.locator('.primary').click();assert(await page.locator('#error').isVisible());
 await page.locator('#example').click();await page.locator('#evalX').fill('15');await page.locator('.primary').click();assert.strictEqual(await page.locator('#status').innerText(),'Extrapolación');
 await page.locator('#addNode').click();assert.strictEqual(await page.locator('.node-row').count(),5);
 await page.locator('.node-x').last().fill('14');await page.locator('.node-y').last().fill('90');await page.locator('.primary').click();assert(!(await page.locator('#error').isVisible()));
 await page.locator('#example').click();await page.locator('#minX').fill('12');await page.locator('.primary').click();assert(await page.locator('#error').isVisible());
 await page.locator('#example').click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/mobile.png',fullPage:true});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepStrictEqual(errors,[]);
 await browser.close();console.log('Interfaz: ejemplo, duplicados, extrapolación, nodos dinámicos, intervalo y móvil correctos.');
})().catch(e=>{console.error(e);process.exit(1)});

