var expect = require('chai').expect,
	pubSubHubbub = require("../index");

suite("Pubsubhubbub tests", function() {
	var pubsub = pubSubHubbub.createServer({
		callbackUrl: "http://kreata.ee:1337",
        secret: "MyTopSecret",
        username: "Test",
        password: "P@ssw0rd"
	});

	test("should exist", function() {
		expect(pubsub).to.exist;
	});

	test("options passed correctly", function() {
		expect(pubsub.callbackUrl).to.equal("http://kreata.ee:1337");
		expect(pubsub.secret).to.equal("MyTopSecret");
	});

	test("create authentication object", function() {
		expect(pubsub.auth).to.exist;
		expect(pubsub.auth.user).to.equal("Test");
		expect(pubsub.auth.pass).to.equal("P@ssw0rd");

		expect(pubsub.auth).to.eql({
			'user': 'Test', 
			'pass': 'P@ssw0rd',
			'sendImmediately': false
		});
	});

});