module.exports = {
	data: {
		name: 'db-test',
		description: 'データベーステスト',
	},
	async execute(interaction, pool) {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM test_table');
    const results = { 'results': (result) ? result.rows : null};
    console.log(results.results[0].name)
		await interaction.reply(results.results[0].name);
	},
};