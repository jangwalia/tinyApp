const { assert } = require('chai');
const { getuserByemail } = require('../helper');
const {users} = require('../express_server');
// running chai tests
describe('getuserByemail', function() {
  it('should return a user with valid email', function() {
    const user = getuserByemail("user1@yahoo.com", users)
    const expectedOutput = 'randomid1';
    assert.strictEqual(user.id,expectedOutput);
  });
  it('Should return undefined for non existant email',function() {
    const user = getuserByemail("some@other.com",users);
    const expectedOutput = undefined;
    assert.strictEqual(user,expectedOutput);
  })
});