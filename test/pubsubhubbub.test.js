var expect = require('chai').expect,
	http = require('http'),
	request = require('request'),
	crypto = require('crypto'),
	pubSubHubbub = require("../index");

var pubsub = pubSubHubbub.createServer({
		callbackUrl: "http://localhost:8000/callback",
        secret: "MyTopSecret",
        username: "Test",
        password: "P@ssw0rd"
	});

var topic = 'http://test.com',
	response_body = "This is a response.",
	encrypted_secret = crypto.createHmac("sha1", pubsub.secret).update(topic).digest("hex");
	hub_encryption = crypto.createHmac('sha1', encrypted_secret).update(response_body).digest('hex');

var notification = function (){
	var options = {
		url: 'http://localhost:8000',
		headers: {
			'X-Hub-Signature': 'sha1='+hub_encryption,
			'X-PubSubHubbub-Callback': 'http://localhost:8000/callback',
			'hub.topic': 'http://test.com',
			'link': '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
		}
	}
	return request.post(options);
}

describe('pubsubhubbub notification', function () {
	before(function () {
		pubsub.listen(8000);
	});

	it('should fail with 403 - no X-Hub-Signature', function (done){
		var options = {
			url: 'http://localhost:8000',
			headers: {
				'link': '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			}
		}
		request.post(options, function (err, res, body) {
			try{
				expect(res.statusCode).to.equal(403);
				done();	
			} catch (err) {
				done(err);
			}	
		});
	});

	it('should fail with 400 - no topic', function (done) {
		var options = {
			url: 'http://localhost:8000',
			headers: {
				'link': '<http://pubsubhubbub.appspot.com/>; rel="hub"'
			}
		}
		request.post(options, function (err, res, body) {
			try {
				expect(res.statusCode).to.equal(400);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	it('should pass with 204', function (done) {
		var options = {
			url: 'http://localhost:8000',
			headers: {
				'X-Hub-Signature': 'sha1='+hub_encryption,
				'link': '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
			body: response_body
		}
		request.post(options, function (err, res, body) {
			try {
				expect(res.statusCode).to.equal(204);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	after(function () {
		pubsub.server.close();
	});
});

suite("Pubsubhubbub tests", function () {
	test("pubsub should exist", function () {
		expect(pubsub).to.exist;
	});

	test("options passed correctly", function () {
		expect(pubsub.callbackUrl).to.equal("http://localhost:8000/callback");
		expect(pubsub.secret).to.equal("MyTopSecret");
	});

	test("create authentication object", function () {
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

