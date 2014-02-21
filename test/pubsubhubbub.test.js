var expect = require('chai').expect,
	http = require('http'),
	request = require('request'),
	crypto = require('crypto'),
	supertest = require('supertest'),
	pubSubHubbub = require("../index");

var pubsub = pubSubHubbub.createServer({
		callbackUrl: "http://localhost:8000/callback",
        secret: "MyTopSecret",
        username: "Test",
        password: "P@ssw0rd"
	});

var topic = 'http://test.com/feed',
	encrypted_secret = crypto.createHmac("sha1", pubsub.secret).update(topic).digest("hex");

var notification = function(){
	var options = {
		url: 'http://localhost:8000',
		headers: {
			'X-Hub-Signature': encrypted_secret,
			'X-PubSubHubbub-Callback': 'http://localhost:8000/callback',
			'hub.topic': 'http://test.com',
			'link': 'rel=hub"http://localhost/hub";rel=self"http://test.com"'
		}
	}
	return request.post(options);
}

describe('pubsubhubbub', function() {
	before(function() {
		pubsub.listen(8000);
	});

	it('should see post', function(done){
		request.post(notification(), function(err, res, body){
			expect(res.statusCode).to.equal(200);
		});
	});

	after(function() {
		pubsub.server.close();
	});
});

suite("Pubsubhubbub tests", function() {
	test("pubsub should exist", function() {
		expect(pubsub).to.exist;
	});

	test("options passed correctly", function() {
		expect(pubsub.callbackUrl).to.equal("http://localhost:8000/callback");
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

