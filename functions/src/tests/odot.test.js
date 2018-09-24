const odot = require('../odot');

const team = 'testTeam';
const odotText = 'test';

test('creates an odot', async () => {
    await odot.createOdot(odotText, team);
});

test('marks odot as complete', async () => {
    await odot.markOdotAsComplete(odotID, team);
});

test('deletes an odot', async () => {
    await odot.deleteOdot(odotID, team);
});

test('gets all odots', async () => {
    let odots = await odot.getOdots(team) ;
    expect(odots.length).toBe(1);
});

test('nukes odots', async () => {
    await odot.wipeAllTeamTasks(team);
});