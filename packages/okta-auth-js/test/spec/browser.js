jest.mock('cross-fetch');
var OktaAuth = require('../../lib/browser/browserIndex');
var Emitter = require('tiny-emitter');

describe('Browser', function() {

  it('is a valid constructor', function() {
    var auth = new OktaAuth({ url: 'http://localhost/fake' });
    expect(auth instanceof OktaAuth).toBe(true);
  });

  describe('Event emitter', function() {
    it('Can add event callbacks using on()', function() {
      var auth = new OktaAuth({ url: 'http://localhost/fake' });
      var handler = jest.fn();
      auth.on('fake', handler);
      var payload = { foo: 'bar' };
      auth.emitter.emit('fake', payload);
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('Event callbacks can have an optional context', function() {
      var auth = new OktaAuth({ url: 'http://localhost/fake' });
      var context = jest.fn();
      var handler = jest.fn().mockImplementation(function() {
        expect(this).toBe(context);
      });
      auth.on('fake', handler, context);
      var payload = { foo: 'bar' };
      auth.emitter.emit('fake', payload);
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('Can remove event callbacks using off()', function() {
      var auth = new OktaAuth({ url: 'http://localhost/fake' });
      var handler = jest.fn();
      auth.on('fake', handler);
      auth.off('fake', handler);
      var payload = { foo: 'bar' };
      auth.emitter.emit('fake', payload);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', function() {
    it('Listens to error events from TokenManager', function() {
      jest.spyOn(Emitter.prototype, 'on');
      jest.spyOn(OktaAuth.prototype, '_onTokenManagerError');
      var auth = new OktaAuth({ url: 'http://localhost/fake' });
      expect(Emitter.prototype.on).toHaveBeenCalledWith('error', auth._onTokenManagerError, auth);
      var emitter = Emitter.prototype.on.mock.instances[0];
      var error = { errorCode: 'anything'};
      emitter.emit('error', error);
      expect(OktaAuth.prototype._onTokenManagerError).toHaveBeenCalledWith(error);
    });
  
    it('error with errorCode "login_required": Will call option "onSessionEnd" function', function() {
      var onSessionEnd = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onSessionEnd: onSessionEnd });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onSessionEnd).not.toHaveBeenCalled();
      var error = { errorCode: 'login_required'};
      emitter.emit('error', error);
      expect(onSessionEnd).toHaveBeenCalled();
    });

    it('error with unknown errorCode does not call option "onSessionEnd" function', function() {
      var onSessionEnd = jest.fn();
      jest.spyOn(Emitter.prototype, 'on');
      new OktaAuth({ url: 'http://localhost/fake', onSessionEnd: onSessionEnd });
      var emitter = Emitter.prototype.on.mock.instances[0];
      expect(onSessionEnd).not.toHaveBeenCalled();
      var error = { errorCode: 'unknown'};
      emitter.emit('error', error);
      expect(onSessionEnd).not.toHaveBeenCalled();
    });
  });

  describe('options', function() {
    var auth;
    beforeEach(function() {
      auth = new OktaAuth({ url: 'http://localhost/fake' });
    });

    describe('PKCE', function() {

      it('is false by default', function() {
        expect(auth.options.pkce).toBe(false);
      });

      it('can be set by arg', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ pkce: true, url: 'http://localhost/fake' });
        expect(auth.options.pkce).toBe(true);
      });

      it('accepts alias "grantType"', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        auth = new OktaAuth({ grantType: "authorization_code", url: 'http://localhost/fake' });
        expect(auth.options.pkce).toBe(true);
      });

      it('throws if PKCE is not supported', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        function fn() {
          auth = new OktaAuth({ pkce: true, url: 'http://localhost/fake' });
        }
        expect(fn).toThrowError('This browser doesn\'t support PKCE');
      });
    })
  });
});