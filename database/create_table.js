const database = include('dbConnection');

async function createTables() {  
			
	  


	try {
		const resultsUserType = await database.query();
		const resultsUsers = await database.query();


        console.log("Successfully created _______ table");
		console.log(resultsUserType[0]);

		console.log("Successfully created _______ table");
		console.log(resultsUsers[0]);

		return true;
	}
	catch(err) {
		console.log("Error Creating tables");
        console.log(err);
		return false;
	}
}

module.exports = {createTables};