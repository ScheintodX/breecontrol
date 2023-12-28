import notify from './matrixnotify.js'

async function main(){
	await notify( "Hello Me" );
}

main().then( console.log );
