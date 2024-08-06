import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    let year = query.year || new Date().getFullYear();  
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.timeanddate.com/moon/phases/?year=' + year);

    let items = await page.evaluate(() => {
        const table = document.querySelector('.fw.hoz.tb-hover');
        const items = [];

        if (table) {
            const tbodies = table.querySelectorAll('tbody');
            if (tbodies.length >= 2) {
                const rows = tbodies[1].querySelectorAll('tr');
                rows.forEach(row => {
                    const columns = row.querySelectorAll('td');
                    columns.forEach(column => {
                        const imgs = column.querySelectorAll('img');
                        imgs.forEach(img => {
                            const titleParts = img.getAttribute('title').split(' ');
                            const phase = titleParts.slice(0, 2).join(' ');
                            const date = new Date(titleParts.slice(4, 7).join(' ').split(',')[0]);
                            let symbol = '';
                            switch (phase) {
                                case 'New Moon':
                                    symbol = '🌑';
                                  break;
                                case 'First Quarter':
                                    symbol = '🌓';
                                  break;
                                case 'Full Moon':
                                    symbol = '🌕';
                                  break;
                                case 'Third Quarter':
                                    symbol = '🌗';
                                  break;
                            }
                            items.push({
                                Phase: phase,
                                Symbol: symbol,
                                Date: date.toISOString().split('T')[0]
                            });
                        });
                    });
                });
            }
        }
        return items;
    });

    await browser.close();

    return {
        items
    };
});