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

async function check_friend_req_exists(postData){
	let checkFriendReqExistsSQL = `
	SELECT * 
	FROM friends
	WHERE (user_id1 = :requesterId AND user_id2 = :friendId)
	OR (user_id1 = :friendId AND user_id2 = :requesterId);
	`;

	let params = {
		requesterId : postData.requesterId,
		friendId: postData.friendId
	};

	try {
		const results = await database.query(checkFriendReqExistsSQL, params);
		return results[0];
	} catch(err) {
		console.log("Error checking friend if friend request exists");
		console.log(err);
		return false;
	}
}

async function createFriendReq(postData) {
	let createFriendReqSQL = `
	INSERT 	INTO friends (user_id1, user_id2, status, action_user_id)
	VALUES (:requesterId, :friendId, 'pending', requestId);
	`;

	let params = {
		requesterId: postData.requesterId,
		friendId: postData.friendId
	};

	try {
		const results = await database.query(createFriendReqSQL, params)
		return results[0]
	} catch(err) {
		console.log("Error creating friend request");
		console.log(err);
		return false;
	}
}

async function createEvent(postData){
	let createEventSQL = `
	INSERT INTO events (user_id, title, start_time, end_time, color, deleted)
	VALUES (:user_id, :title, :start_time, :end_time, :color, :deleted);
	`;

	let params = {
		userId: postData.userId,
		title: postData.title,
		start_time: postData.start_time,
		end_time: postData.end_time,
		color: postData.color,
		deleted: postData.deleted
	};

	try {
		const results = await database.query(createEventSQL, params)
		return results[0]
	} catch(err){
		console.log("Error in creating event");
		console.log(err);
		return false;
	}
}

async function softDeleteEvent(postData) {
	let softDeleteEventSQL = `
	UPDATE events SET deleted = true, delete_time = :delete_time
	WHERE event_id = :event_id;
	`;

	let params = {
		eventId: postData.eventId,
		deleteTime: postData.deleteTime
	};

	try {
		const results = await database.query(softDeleteEventSQL, params)
		return results[0]
	} catch(err){
		console.log("Error in soft deleting event");
		console.log(err);
		return false;
	}
}


module.exports = {getUser, createUser, check_friend_req_exists, createFriendReq, createEvent, softDeleteEvent}
