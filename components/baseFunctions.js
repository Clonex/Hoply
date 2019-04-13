export async function api(path = "users", method = "GET", payload = false)
{
	try {
		let response = await fetch("http://caracal.imada.sdu.dk/app2019/" + path, {
	        method: method,
	        body: payload ? JSON.stringify(payload) : undefined,
	        headers: {
			    	"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwMjAxOSJ9.3MGDqJYkivAsiMOXwvoPTD6_LTCWkP3RvI2zpzoB1XE",
			    	"Content-type": "application/json",
			    }
	      });
	  return method === "GET" ? response.json() : response.text();
  } catch(e) {
  	console.log("Error", e);
		return false;
	}
}


