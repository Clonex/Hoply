export async function api(endpoint = "users", params = {}, method = "GET", payload = false)
{
	try {
		let paramVar = swaggerParams(params).join("&");
		let response = await fetch("http://caracal.imada.sdu.dk/app2019/" + endpoint + "?" + paramVar, {
			method: method,
	        body: payload ? JSON.stringify(payload) : undefined,
	        headers: {
				"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwMjAxOSJ9.3MGDqJYkivAsiMOXwvoPTD6_LTCWkP3RvI2zpzoB1XE",
				"Content-type": "application/json",
			}
		});
		return method === "GET" ? response.json() : response.status;
	} catch(e) {
		console.log("Error", e);
		return false;
	}
}

export async function syncBasic(db, type, WHERE = "id")
{
	/*
      Y NO UNIX TIMESTAMP! D:
      let data = await transaction(db, 'SELECT stamp FROM users ORDER BY id DESC LIMIT 1');
      let extraParams = data.length > 0 ? {stamp: "gt." + data._array[0].stamp} : {};
      */
	 let newUsers = await api(type);
	 //Delete deleted data
	 if(newUsers.length > 0)
	 {
		 let uIDs = newUsers.map(user => ('"' + user[WHERE] + '"')).join(",");
		 await transaction(db, 'DELETE FROM ' + type + ' WHERE ' + WHERE + ' NOT IN (' + uIDs + ')')
	}else{
		transaction(db, 'DELETE FROM ' + type);
	}
	//Add new data
	 for(let i = 0; i < newUsers.length; i++)
	 {
		 let user = newUsers[i];
		 let userCheck = await transaction(db, 'SELECT ' +  WHERE + ' FROM ' + type + ' WHERE ' + WHERE + ' = ?', [user[WHERE]]);
	   if(userCheck.length === 0)
	   {
		   switch(type)
		   {
					case "users":
						transaction(db, 'insert into users (id, name, stamp) values (?, ?, ?)', [user.id, user.name, user.stamp]);
					break;
					case "follows":
						transaction(db, 'insert into follows (follower, followee, stamp) values (?, ?, ?)', [user.follower, user.followee, user.stamp]);
					break;
		   }
		 
	   }
	 }
}
export async function syncUsers(db)
{
	/*
      Y NO UNIX TIMESTAMP! D:
      let data = await transaction(db, 'SELECT stamp FROM users ORDER BY id DESC LIMIT 1');
      let extraParams = data.length > 0 ? {stamp: "gt." + data._array[0].stamp} : {};
      */
	 let newUsers = await api("users");
  
	 for(let i = 0; i < newUsers.length; i++)
	 {
	   let user = newUsers[i];
	   let userCheck = await transaction(db, 'SELECT id FROM users WHERE id=?', [user.id]);
	   if(userCheck.length === 0)
	   {
		 transaction(db, 'insert into users (id, name, stamp) values (?, ?, ?)', [user.id, user.name, user.stamp]);
	   }
	 }
}

export async function syncMessages(db)
{
	let data = await transaction(db, 'SELECT id FROM messages ORDER BY id DESC LIMIT 1');
	let extraParams = data.length > 0 ? {id: {t: ">", v: data._array[0].id}} : {};

	let newMessages = await api("messages", extraParams);
	for(let i = 0; i < newMessages.length; i++)
	{
		let message = newMessages[i];
		let messageCheck = await transaction(db, 'SELECT id FROM messages WHERE id=?', [message.id]);
		if(messageCheck.length === 0)
		{
			transaction(db, 'insert into messages (id, sender, receiver, body, stamp) values (?, ?, ?, ?, ?)', [message.id, message.sender, message.receiver, message.body, message.stamp]);
		}
	}

}




export function def(val, fallback = "")
{
	return val ? val : fallback;
}

import { NavigationActions } from 'react-navigation';
export function navigate(route, me, payload = {})
{
	const navigateAction = NavigationActions.navigate({
		routeName: route,
		params: payload,
	});
	me.props.navigation.dispatch(navigateAction);
}

export function transaction(db, SQL, items = [])
{
	return new Promise(r => {
		db.transaction(async tx => {
			let data = await query(tx, SQL, items);
			r(data);
		});
	});
}


export function query(tx, SQL, items = [])
{
	return new Promise((resolve, reject) => tx.executeSql(SQL, items, (_, { rows }) => resolve(rows), null));
}


function swaggerParams(data = {})
{
	let types = {
		"=": "eq",
		">": "gt",
		"<": "lt",
		"contains": "contains",
		"startswidth": "startswidth",
	};
	return Object.keys(data).map(param => {
		let d = data[param];
		return param + "=" + types[d.t] + "." + d.v;
	});
}

