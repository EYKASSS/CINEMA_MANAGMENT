const supertest = require('supertest');
const request = supertest('http://localhost:3000');

describe('Express Route Test', function () {
	// it('should return hello world', async () => {
	// 	return request
	// 		.get('/hello')
	// 		.expect(200)
	// 		.expect('Content-Type', /text/)
	// 		.then(res => {
	// 			expect(res.text).toBe('Hello BENR2423');
	// 		});
	// })

	it('login successfully', async () => {
		return request
			.post('/login')
			.send({username: 'user1', password: "abc123" })
			.expect('Content-Type', /json/)
			.expect(200).then(response => {
				expect(response.body).toEqual({
						_id: expect.stringMatching("6281f89e3de33fd8283f7228"),
						username: expect.stringMatching("user1"),
					});
			});
	});

			
	it('login failed', async () => {
		return request
			.post('/login')
			.send({username: 'UTeM', password: "p@ssw0rd" })
			.expect('Content-Type', /json/)
			.expect(401).then(response => {
				expect(response.body).toEqual(
					expect.objectContaining({
						error: expect.any(String)
					})
				);
			});
	});


	it('register', async () => {
		return request
			.post('/register')
			.send({username: 'UTeM', password: "p@ssw0rd" })
			.expect('Content-Type', /json/)
			.expect(200).then(response => {
				expect(response.body).toEqual(
					expect.objectContaining({
						message: expect.any(String)
					})
				);
			});
	});
	
	
	it('register failed', async () => {
		return request
			.post('/register')
			.send({username: 'user1', password: "abc123" })
			.expect('Content-Type', /json/)
			.expect(404).then(response => {
				expect(response.body).toEqual(
					expect.objectContaining({
						error: expect.any(String),
					})
				);
			});
	})
});