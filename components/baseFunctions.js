export const WALL_ID = "7e1b11e7-0d3f-4360-9e68-b3b5faf08ddc";
export const COMMENTS_ID = "ae3c71d8-e0b6-4b7c-a762-1536d81fde49";
export const LIKES_ID = "dffaa264-5418-4c1f-aa9c-f6493e0f915c";
export const PB_ID = "d7d64795-9c9d-4a4f-b2d5-116d452e378f";

/*
 * Creates a appropriate request to the Postgres API.
 */
export async function api(endpoint = "users", params = {}, method = "GET", payload = false)
{
	try {
		let paramVar = typeof params === "string" ? params : swaggerParams(params).join("&");
		if(endpoint === "messages")
		{
			//console.log("API", "http://caracal.imada.sdu.dk/app2019/" + endpoint + "?" + paramVar);
		}
		let response = await fetch("http://caracal.imada.sdu.dk/app2019/" + endpoint + "?" + paramVar, {
			method: method,
	        body: payload ? JSON.stringify(payload) : undefined,
	        headers: {
				"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwMjAxOSJ9.3MGDqJYkivAsiMOXwvoPTD6_LTCWkP3RvI2zpzoB1XE",
				"Content-type": "application/json",
			}
		});
		let resp = method === "GET" ? response.json() : response.status;
		return resp;
	} catch(e) {
		console.log("Error", e);
		return false;
	}

}

import { Permissions } from "expo";
/*
	* Asks and checks if the needed permissions has been given.
	*/
export async function askPermissionsAsync() {
	const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL, Permissions.LOCATION);
	return status === "granted";
}

/*
 * @returns a subset of the string, if its longer than the given @param length.
 */
export function maxString(string, length = 10)
{
	return string.length > (length + 2) ? string.substring(0, length) + ".." : string;
}




export async function getWall(db, user = false)
{
	try {
		let data;
		if(user)
		{
			data = await transaction(db, `SELECT 
																				*,
																				(SELECT name FROM users WHERE id = messages.sender LIMIT 1) as senderName
																			FROM messages WHERE 
																				receiver = ? AND sender = ?
																			ORDER BY id DESC `, [WALL_ID, user]);
		}else{
			data = await transaction(db, `SELECT 
																				*,
																				(SELECT name FROM users WHERE id = messages.sender LIMIT 1) as senderName
																			FROM messages 
																				WHERE receiver = ? 
																			ORDER BY id DESC `, [WALL_ID]);
		}
		if(data)
		{
			return data._array;
		}
	} catch(e)
	{
		console.log("Err", e);
	}

	return [];
}

export function CMDbuilder(type, data)
{
	return "%" + type + " " + data;
}

export function CMDparser(data)
{
	if(data && data.substring(0, 1) === "%")
	{
		let msgData = data.substring(1).split(" ");
		let cmd = msgData[0];
		msgData = data.substring(1).split(cmd + " ");
		let cmdData = cmd === "JSON" ? JSON.parse(msgData[1]) : msgData[1];
		return {cmd, data: cmdData};
	}
	return {cmd: false, data: false};
}
//.fromNow();
import moment from "moment";
export function ISOparser(ISOstring)
{
	return moment(ISOstring).fromNow();
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
export function transactions(db, callback)
{
	return new Promise(r => {
		db.transaction(async tx => {
			callback(tx, r);
		});
	});
}


export function query(tx, SQL, items = [])
{
	return new Promise((resolve, reject) => tx.executeSql(SQL, items, (_, { rows }) => resolve(rows), (a, b) => {
		console.log("SQL err", SQL, items, "| Error data", a, b);
		resolve([]);
	}));
}

function encodeURL(v = "")
{
	return encodeURIComponent(v).replace(/%20/g,'+');
}

function swaggerParams(data = {}, prefix = "=")
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
		return param + prefix + types[d.t] + "." + encodeURL(d.v);
	});
}

import uuid from "uuid/v4";
/*
 * The ViewModel class, which makes it easier to post/get data from the local and remote database.
 */
export class ViewModel {
	constructor(db, userID = false, syncSlag = 100)
	{
		this.db = db;
		this.userID = userID;
		this.syncSlag = syncSlag;
		this.syncData = {};
		this.syncDeletedData = {};
	}
	
	setUserID(id)
	{
		this.userID = id;
	}

	async do(type = "like", data = {}, callback = false)
	{
		if(type === "like")
		{
			await api("follows", {}, "POST", {
        follower: data.id,
        followee: data.userID
			});
			await this.sync("follows");
		}else if(type === "pb")
		{
			await this.do("message", {
				sender: this.userID,
				body: data.body,
				receiver: PB_ID
			});
			await this.sync("messages");
			if(callback)
			{
				callback();
			}

		}else if(type === "message")
		{
			/*await transaction(this.db, 
				`INSERT INTO messages 
				(id, sender, receiver, body, stamp, unixStamp) 
					VALUES 
				(?, ?, ?, ? ,? ,?)`, []);*/
			await api("messages", {}, "POST", data);
			//await this.sync("messages");
			if(callback)
			{
				callback();
			}

		}else if(type === "createUser")
		{
			let respData = await api("users", {}, "POST", {id: data.id, name: data.name});
			return respData === 200 || respData === 201;
		}else if(type === "group")
		{
			console.log("ViewModel group", data);
			let groupID = uuid();

			/*
				Local shit
			*/
			await transaction(this.db, `INSERT INTO groups (name, id) VALUES (?, ?)`, [data.title, groupID]);
			await transactions(this.db, async (tx, resolve) => {
				let localPromises = data.users.map(user => query(tx, 
					`INSERT INTO groupUsers (groupID, userID) VALUES (?, ?)`, [groupID, user]
				));
				await Promise.all(localPromises);
				resolve();
			});
	

			/*	
				Server stuff
			*/
			await this.do("createUser", {
				id: groupID,
				name: "%GRP " + data.title
			});
			let promises = data.users.map(user => this.do("like", {
				id: user,
				userID: groupID
			}));
			await Promise.all(promises);
			await this.do("message", {
				sender: this.userID,
				body: "Created a new group chat!",
				receiver: groupID
			});

			//DONE
			console.log("Group created!", promises);

			
		}else if(type === "unlike")
		{
			await api("follows", {
        follower: {
          t: "=",
          v: data.id
        },
        followee: {
          t: "=",
          v: data.userID
        },
			}, "DELETE");
			await transaction(this.db, 
			`DELETE FROM 
				follows 
			WHERE 
				follower = ?
			AND
				followee = ?`, [data.id, data.userID]);
		}
	}

	async get(type = "messages", callback = null, where = []){
		let data;
		let groupIDs;
		let groupData;
		if(type === "messages")
		{
			let sqlQuery = 
			`SELECT 
						*, 
						(SELECT name FROM users WHERE id = messages.sender LIMIT 1) as senderName, 
						(SELECT name FROM users WHERE id = messages.receiver LIMIT 1) as receiverName
				FROM messages 
					WHERE receiver NOT IN ("` + WALL_ID + `", "` + PB_ID + `")
				ORDER BY id DESC`;

			if(callback)
			{
				groupIDs = await this.get("groupIDs");
				groupData = (await transaction(this.db, 
								`SELECT 
									* 
								FROM groups 
								WHERE id IN (?)`, groupIDs.map(d => d.id)))._array;
				console.log("Groups", data, "ids", groupIDs);

				data = (await transaction(this.db, sqlQuery))._array;
				callback({data, groups: groupData});
			}
			await this.sync("messages");//await syncMessages(this.db);
			groupIDs = await this.get("groupIDs");
			groupData = (await transaction(this.db, 
							`SELECT 
								* 
							FROM groups 
							WHERE id IN (?)`, groupIDs.map(d => d.id)))._array;
			data = (await transaction(this.db, sqlQuery))._array;

			data = {data, groups: groupData};
			//console.log("Messages2 data", data);
		}else if(type === "follows")
		{
			
		}else if(type === "getWall")
		{
			let query = 
				where.length > 0 ? 
					`SELECT 
								*,
								(SELECT img from profilePicture WHERE userID = ? ORDER BY unixStamp DESC LIMIT 1) as pb,
								(SELECT name from users WHERE id = ? LIMIT 1) as name
						FROM posts 
							WHERE userID = ?
						ORDER BY unixStamp DESC` 
						: 
					`SELECT 
								*,
								(SELECT img from profilePicture WHERE userID = ? ORDER BY unixStamp DESC LIMIT 1) as pb,
								(SELECT name from users WHERE id = ? LIMIT 1) as name
						FROM posts 
							WHERE userID IN (SELECT followee FROM follows WHERE follower = ?) OR userID = ?
						ORDER BY unixStamp DESC`;
				let newWhere = where.length > 0 ?  [...where, ...where, ...where] : [this.userID, this.userID, this.userID, this.userID];
				if(callback)
				{
					data = (await transaction(this.db, query, newWhere))._array;
					callback(data);
				}
				await this.sync("messages");
				data = (await transaction(this.db, query, newWhere))._array;
		}else if(type === "searchUsers")
		{
			let query = "SELECT * FROM users WHERE name LIKE ? ORDER BY unixStamp DESC";
			if(callback)
			{
				data = (await transaction(this.db, query, where))._array;
				callback(data);
			}
			await this.sync("users");
			data = (await transaction(this.db, query, where))._array;
		}else if(type === "listUsers")
		{
			let query = "SELECT * FROM users WHERE id != ?";
			if(callback)
			{
				data = (await transaction(this.db, query, where))._array;
				callback(data);
			}
			await this.sync("users");
			await this.sync("follows");
			data = (await transaction(this.db, query, where))._array;
		}else if(type === "groupIDs")
		{
			let query = 
			`SELECT 
				id 
			FROM 
				users 
			WHERE 
				name LIKE ? 
				AND id IN (SELECT followee FROM follows WHERE follower = ?)`;
			if(callback)
			{
				data = (await transaction(this.db, query, ["%\%GRP%", this.userID]))._array;
				callback(data);
			}
			await this.sync("users");
			await this.sync("follows");
			data = (await transaction(this.db, query, ["%\%GRP%", this.userID]))._array;
		}else if(type === "getUser")
		{
			let query = "SELECT * FROM users WHERE id = ?";
			if(callback)
			{
				data = (await transaction(this.db, query, where))._array;
				callback(data);
			}
			await this.sync("users");
			await this.sync("follows");
			data = (await transaction(this.db, query, where))._array;
		}
		if(callback)
		{
			callback(data);
		}else{
			return data;
		}
	}

	async forceSync(type, where = {})
	{
		let data = await transaction(this.db, 'SELECT * FROM ' + type + ' ORDER BY unixStamp DESC LIMIT 1');
		let extraParams = data.length > 0 ? {stamp: {t: ">", v: data._array[0].stamp}} : {};
		extraParams = {
			...extraParams,
			...where
		};

		let groupIDs;
		let responseArr;
		if(type === "messages")
		{
			groupIDs = await this.get("groupIDs");
			let IDs = [
				...groupIDs.map(d => d.id),
				this.userID,
				PB_ID,
				WALL_ID
			]
			.map(d => '"' + encodeURL(d) + '"')
			.join(",");
			
			let queryContent = 'or(sender.in.(' + IDs + '),receiver.in.(' + IDs + '))';
			if(Object.keys(extraParams).length > 0)
			{
				queryContent = swaggerParams(extraParams, ".").join(",") + ',' + queryContent;
			}
			let query = "and=" + replaceAll(replaceAll(replaceAll('(' + queryContent + ')', "(", "%28"), ")", "%29"), '"', "%22");
			responseArr = await api(type, query);
		}else{
			responseArr = await api(type, extraParams);
		}
		
		let promises = [];
		for(let i = 0; i < responseArr.length; i++)
		{
			let currResp = responseArr[i];
			let query = 'INSERT INTO ' + type + ' (' + Object.keys(currResp).join(",") + ', "unixStamp") VALUES (' + Object.keys(currResp).map(key => "?").join(",") + ', ?)';
			if(type === "messages")
			{
				let isGroup = groupIDs.find(d => d.id === currResp.receiver);
				let isPost = currResp.receiver === WALL_ID;
				let isProfilePic = currResp.receiver === PB_ID;
				if(isGroup)
				{
					//console.log("GROUP data", currResp);
					promises.push(transaction(this.db, 'INSERT INTO groups (name, id) VALUES (?, ?)', [
						"TEST",
						currResp.receiver,
					]));
				}
				if(isPost)
				{
					promises.push(transaction(this.db, 'INSERT INTO posts (userID, text, msgID, unixStamp) VALUES (?, ?, ?, ?)', [
						currResp.sender,
						currResp.body,
						currResp.id,
						moment(currResp.stamp).unix(),
					]));
				}
				if(isProfilePic)
				{
					console.log("Saving piucture!");
					promises.push(transaction(this.db, 'INSERT INTO profilePicture (userID, img, stamp, unixStamp, msgID) VALUES (?, ?, ?, ?, ?)', [
						currResp.sender,
						currResp.body,
						moment(currResp.stamp).unix(),
						currResp.stamp,
						currResp.id
					]));
				}
				//console.log("INSERTING", type, currResp);
			}
			let datArr = [
				...Object.keys(currResp).map(key => currResp[key]),
				moment(currResp.stamp).unix()
			];
			promises.push(transaction(this.db, query, datArr));
		}
		await Promise.all(promises);
	}

	/*
	 * Checks the given table for deleted data.
	 */
	async syncDeleted(type, where = {})
	{
		let curr = this.syncDeletedData[type];
		let minCheck = 5000;
		if(Object.keys(where) > 0 || !curr || (Date.now() - curr) > minCheck)
		{
			this.syncDeletedData[type] = Date.now();
			if(type === "messages" || type === "users")
			{
				let rawData = await transaction(this.db, "SELECT id FROM " + type + " ORDER BY id ASC");
				if(rawData.length > 0)
				{
					let parsedData = rawData._array.filter(d => d.length > 0).map(d => '"' + d.id + '"');
					let check = await api(type, "select=id&id=in.(" + parsedData.join(",") + ")", "GET");
					if(parsedData.length > check.length)
					{
						check = check.map(d => d.id);
						let removeIDs = rawData._array.find(d => check.indexOf(d) === -1);
						console.log("Something has been deleted in", type, "remove", removeIDs);
						let promises = removeIDs.map(d => transaction(this.db, "DELETE FROM " + type + " WHERE id = ?", [d.id]));
						await Promise.all(promises);
					}
				}
			}else if(type === "follows")
			{
				let rawData = await transaction(this.db, "SELECT follower, followee FROM follows ORDER BY follower ASC");
				if(rawData.length > 0)
				{
					let andPairs = rawData._array.map(d => 'and(follower.eq."' + d.follower + '",followee.eq."' + d.followee + '")');
					let check = await api(type, "select=follower,followee&or=(" + andPairs.join(",") + ")", "GET");
					if(andPairs.length > check.length)
					{
						let removeIDs = rawData._array.filter(data => {
							return !check.find(other => other.follower === data.follower && other.followee === data.followee);
						});
						let promises = removeIDs.map(d => transaction(this.db, "DELETE FROM follows WHERE follower = ? AND followee = ?", [d.follower, d.followee]));
						await Promise.all(promises);
					}
				}
			}
			this.syncDeletedData[type] = Date.now();
		}
	}

	/*
	 * Synchronizes the given table, if it has been more time than this.syncSlag.
	 */
	async sync(type, where = {})
	{
		let curr = this.syncData[type];
		await this.syncDeleted(type);
		if(Object.keys(where) > 0 || !curr || (Date.now() - curr) > this.syncSlag)
		{
			//console.log("Syncing", type, "time =", this.syncData[type], "Diff =", (Date.now() - curr));
			this.syncData[type] = Date.now();
			let data = await this.forceSync(type, where);
			this.syncData[type] = Date.now();
			return data;
		}
	}
}

function replaceAll(str, find, replace) {
	return str.split(find).join(replace);
}