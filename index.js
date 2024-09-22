const puppeteer = require('puppeteer');
const say = require('say'); // Install with `npm install say`
const fs = require('fs');
const axios = require('axios'); // Install with `npm install axios`

(async () => {
    async function getWeather() {
        const apiKey = '926d2a8e447684fc33a3e648d9a9c930'; // Replace with your actual API key
        const city = 'Gandhinagar';
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        return response.data.main.temp + '°C, ' + response.data.weather[0].description;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    let results = []; // Store results here

    try {
        // Get current date, day, and weather
        const currentDate = new Date();
        const day = currentDate.toLocaleString('en-US', { weekday: 'long' });
        const date = currentDate.getDate(); // Get the day of the month
        const month = currentDate.toLocaleString('en-US', { month: 'long' }); // Get the month name
        const weather = await getWeather();

        // Welcome message
        const welcomeMessage = `Hello Marmik, welcome back. Today's date is ${date} ${month} and it's a ${day}. The current weather is ${weather}. I will now start telling some headlines I fetched for you from the internet for today.`;
        console.log(welcomeMessage);
        await new Promise((resolve) => {
            say.speak(welcomeMessage, null, 1.0, () => {
                resolve();
            });
        });

        console.log('Navigating to BBC News...');
        await page.goto('https://www.bbc.com/news', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Successfully navigated to BBC News.');

        // Wait for articles to load
        console.log('Waiting for articles to load...');
        await page.waitForSelector('[data-testid="card-headline"]', { timeout: 120000 });
        console.log('Articles loaded.');

        // Extract news articles
        console.log('Extracting news articles...');
        results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('[data-testid="card-headline"]'));
            return items.map(item => {
                const title = item.innerText;
                const linkElement = item.closest('a[data-testid="internal-link"]');
                const link = linkElement ? linkElement.href : null;

                return { title, link };
            }).filter(article => article.title && article.link);
        });

        // Limit results to 20 headlines
        results = results.slice(0, 20);

        // Log extracted results to the console
        console.log('Extracted results (limited to 20):');
        results.forEach(article => {
            console.log(`Title: ${article.title}`);
            console.log(`Link: ${article.link}`);
        });

        // Read headlines aloud
        for (const article of results) {
            console.log(`Reading title: ${article.title}`);
            await new Promise((resolve) => {
                say.speak(article.title, null, 1.0, () => {
                    resolve();
                });
            });
        }

        // Save results to a JSON file after processing all articles
        if (results.length > 0) {
            const currentTime = new Date().toLocaleString().replace(/[\/:]/g, '-');
            const fileName = `news_${currentTime}.json`;
            fs.writeFileSync(fileName, JSON.stringify(results, null, 2));
            console.log(`Results saved to ${fileName}`);
        } else {
            console.log('No articles found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log('Closing the browser...');
        await browser.close();
        console.log('Browser closed.');
    }
})();






// const puppeteer = require('puppeteer');
// const say = require('say'); // Install with `npm install say`
// const fs = require('fs');

// (async () => {
//     // Launch the browser in headless mode
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     page.on('console', msg => console.log('PAGE LOG:', msg.text()));

//     let results = []; // Store results here

//     try {
//         console.log('Navigating to BBC News...');
//         await page.goto('https://www.bbc.com/news', { waitUntil: 'networkidle2', timeout: 60000 });
//         console.log('Successfully navigated to BBC News.');

//         // Wait for articles to load
//         console.log('Waiting for articles to load...');
//         await page.waitForSelector('[data-testid="card-headline"]', { timeout: 120000 });
//         console.log('Articles loaded.');

//         // Extract news articles
//         console.log('Extracting news articles...');
//         results = await page.evaluate(() => {
//             const items = Array.from(document.querySelectorAll('[data-testid="card-headline"]'));
//             return items.map(item => {
//                 const title = item.innerText;
//                 const linkElement = item.closest('a[data-testid="internal-link"]');
//                 const link = linkElement ? linkElement.href : null;

//                 return { title, link };
//             }).filter(article => article.title && article.link);
//         });

//         // Limit results to 20 headlines
//         results = results.slice(0, 20);

//         // Log extracted results to the console
//         console.log('Extracted results (limited to 20):');
//         results.forEach(article => {
//             console.log(`Title: ${article.title}`);
//             console.log(`Link: ${article.link}`);
//         });

//         // Read headlines aloud
//         for (const article of results) {
//             console.log(`Reading title: ${article.title}`);
//             await new Promise((resolve) => {
//                 say.speak(article.title, null, 1.0, () => {
//                     resolve();
//                 });
//             });
//         }

//         // Save results to a JSON file after processing all articles
//         if (results.length > 0) {
//             const currentTime = new Date().toLocaleString().replace(/[\/:]/g, '-');
//             const fileName = `news_${currentTime}.json`;
//             fs.writeFileSync(fileName, JSON.stringify(results, null, 2));
//             console.log(`Results saved to ${fileName}`);
//         } else {
//             console.log('No articles found.');
//         }

//     } catch (error) {
//         console.error('Error:', error);
//     } finally {
//         console.log('Closing the browser...');
//         await browser.close();
//         console.log('Browser closed.');
//     }
// })();
