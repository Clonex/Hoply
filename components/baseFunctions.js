export async function api(path = "users", params = {}, method = "GET", payload = false)
{
	try {
		let paramVar = swaggerParams(params).join("&");
		let response = await fetch("http://caracal.imada.sdu.dk/app2019/" + path + "?" + paramVar, {
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

