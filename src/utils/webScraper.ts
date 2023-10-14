import puppeteer from 'puppeteer';

type PlayerArray = [string, string, string, string];

const getPlayerPosition = (item: string, arr: PlayerArray) => {
  const playerIndex = arr.indexOf(item);
  switch (playerIndex) {
    case 0:
      return 'RB';
    case 1:
      return 'WR';
    case 2:
      return 'QB';
    case 3:
      return 'TE';
    default:
      return null;
  }
};

const getTradeValues = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(
    'https://fantasycalc.com/trade-value-chart?numQbs=1&leagueType=Redraft',
    {
      waitUntil: 'domcontentloaded',
    }
  );

  // get Dom nodes for each row container. Use waitForSelector to wait for the chart to load
  await page.waitForSelector('.trade-chart-row.ng-star-inserted');
  const rowContainers = await page.$$('.trade-chart-row.ng-star-inserted');

  // get text content of each row container
  const players = await Promise.all(
    Array.from(rowContainers).map(async (rowContainer) => {
      const { value, player } = await rowContainer.evaluate((el) => ({
        value: parseInt(
          el?.querySelector('.value-item')?.textContent || '0',
          10
        ),
        player: Array.from(
          el?.querySelectorAll('.trade-chart-player-item.ng-star-inserted') ||
            []
        ).map((childNode: ChildNode) => childNode.textContent || ''),
      }));
      return { value, player };
    })
  );

  const playersWithPositions = players.flatMap((item) =>
    item.player
      .map((player) => ({
        value: item.value,
        name: player,
        position: getPlayerPosition(player, item.player as PlayerArray),
      }))
      .filter((player) => player.name !== '')
  );

  // Close the browser
  await browser.close();

  return playersWithPositions;
};

export default getTradeValues;
