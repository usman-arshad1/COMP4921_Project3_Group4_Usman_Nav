const database = include('dbConnection');

async function createUser(postData) {
	let createUserSQL = `
		INSERT INTO users (username, email, password, type) 
		VALUES (:user, :email, :hashed_pass, 'user');
	`;
	let params = {
		user: postData.username,
		email: postData.email,
		hashed_pass: postData.hashed_pass
	}
	
	try {
		const results = await database.query(createUserSQL, params);

		return true;
	}
	catch(err) {
		console.log("Error inserting user");
        console.log(err);
		return false;
	}
}

async function getUser(postData) {
	let getUserSQL = `
		SELECT *
		FROM users
		WHERE username = :username;
	`;

	let params = {
		username: postData.username
	}
	
	try {
		const results = await database.query(getUserSQL, params);

		return results[0];
	}
	catch(err) {
		console.log("Error trying to find user");
        console.log(err);
		return false;
	}
}

module.exports = {getUser, createUser}