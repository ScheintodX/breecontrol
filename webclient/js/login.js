async function main(){

	/* Note: This was intended to be used with login.html and following nginx config:
	*
	* location = /login.html {
	*   auth_basic off;
	*   proxy_pass http://localhost:3001;
	*   add_header X-Served-By nginx-proxy;
	* }
	* location @custom401 {
	*   return 302 /login.html;
	* }
	*
	* but this fails because chrome does not want to send credentials which are
	* given by url or otherwise.
	*/

	document.getElementById( "loginform" ).addEventListener( "submit", function( ev ){

		ev.preventDefault();

		const username = document.getElementById( "username" ).value,
		      password = document.getElementById( "password" ).value,
		      userpass = username + ":" + password,
		      headers = new Headers();

		headers.append( "Authorization", "Basic " + btoa( userpass ));

		fetch( "/", { method: "HEAD", headers: headers, redirect: "error" } )
				.then( window.location.href = "https://" + userpass + "@kiln.binary-kitchen.de/" )
				.catch( () => {} )
				;

	} );
}

main();



