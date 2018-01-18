let th = require("./testFrame/testHelper.js");
process.env.TESTPATH = "./test/testdata.json";
let app = require("../app.js");
let request = require("./testFrame/requestSimulator.js");
const chai = require('chai');
const assert = chai.assert;
describe('app', () => {
  describe('GET /bad', () => {
    it('responds with 404', done => {
      request(app, {
        method: 'GET',
        url: '/bad'
      }, (res) => {
        assert.equal(res.statusCode, 404);
        done();
      })
    })
  })
  describe('GET /', () => {
    it('redirects to home', done => {
      request(app, {
        method: 'GET',
        url: '/'
      }, (res) => {
        th.should_be_redirected_to(res, '/home');
        assert.equal(res.body, "");
        done();
      })
    })
  })
  describe('GET /index.html', () => {
    it('gives the index page', done => {
      request(app, {
        method: 'GET',
        url: '/'
      }, res => {
        th.should_be_redirected_to(res, '/home');
      })
      done();
    })
  })
  describe('GET /login.html', () => {
    it('serves the login page', done => {
      request(app, {
        method: 'GET',
        url: '/login'
      }, res => {
        th.body_contains(res, 'userName:');
        th.body_does_not_contain(res, 'login failed');
      })
      done();
    })
  })
  describe('GET /login', () => {
    it('serves the login page with message for a failed login', done => {
      request(app, {
        method: 'GET',
        url: '/login',
        headers: {
          'cookie': 'message=login failed'
        }
      }, res => {
        th.status_is_ok(res);
        th.body_contains(res, 'userName');
        th.body_contains(res, 'login failed');
        // th.should_not_have_cookie(res, 'message');
      })
      done();
    })
  });
  describe('POST /login', () => {
    it('redirects to home for valid user', done => {
      request(app, {
        method: 'POST',
        url: '/login',
        body: 'userName=ashishm'
      }, res => {
        th.should_be_redirected_to(res, '/home');
        th.should_not_have_cookie(res, 'message');
      })
      done();
    })
  })
  describe('POST /login', () => {
    it('redirects to login.html with message for invalid user', done => {
      request(app, {
        method: 'POST',
        url: '/login',
        body: 'username=badUser'
      }, res => {
        th.should_be_redirected_to(res, '/login');
        th.should_have_expiring_cookie(res, 'message', 'login failed');
      })
      done();
    })
  });
  describe('GET /logout', () => {
    it('serves the home page and login link', done => {
      request(app, {
        method: 'GET',
        url: '/home'
      }, res => {
        th.status_is_ok(res);
        th.body_contains(res, `href="login">login to add todo`);
        th.body_does_not_contain(res, 'login failed');
        done();
      })
    })
  })
  describe('GET /home', () => {
    it('should serve the home page for logged in user', (done) => {
      let headers = {
        cookie: "sessionid=123456"
      }
      let user = {
        userName: 'ashishm',
        name: 'ashish mahindrakar',
      }
      request(app, {
        method: "GET",
        url: "/home",
        user: user,
        headers: headers
      }, res => {
        th.status_is_ok(res);
        th.body_contains(res, "Logout");
        done();
      })
    });
  });
  describe('GET /staticFiles', () => {
    it('should give script files when asked for', (done) => {
      request(app, {
        method: "GET",
        url: "/templatesrc/tempsrc.js"
      }, res => {
        th.status_is_ok(res);
        th.body_contains(res, "new XMLHttpRequest()");
        done();
      })
    });
  })
  describe('GET /css', () => {
    it('should serve css files when asked for ', (done) => {
      request(app, {
        method: "GET",
        url: "/css/main.css"
      }, res => {
        th.status_is_ok(res);
        th.body_contains(res, "margin-left: 1000px;");
        done();
      })
    });
  });
  describe('todoActions', () => {
    beforeEach(() => {
      headers = {
        cookie: "sessionid=100"
      }
      user = {
        userName: 'ashishm',
        name: 'ashish mahindrakar',
      }
      options = {
        method:"POST",
        url:"",
        headers:headers,
        user:user
      }
    });
    describe('POST /loadAllToDoList', () => {
      it('should give all the todo list of logged in user', (done) => {
        options.method = "POST"
        options.url = "/loadAllToDoList"
        request(app,options, res => {
          // console.log(res);
          th.status_is_ok(res);
          th.body_contains(res, `name="button">view</button>`);
          done();
        })
      });
    });
    describe('POST /addAToDoList', () => {
      it('should add a todo list to logged in user', (done) => {
        options.method="POST";
        options.url="/addAToDoList";
        options.body="title=school&description=school";
        request(app,options, res => {
          th.should_be_redirected_to(res,"/home")
          done();
        })
      });
    });
    describe('POST /showToDoItems', () => {
      it('should give back all the todo items of a title given', (done) => {
        options.method="POST";
        options.url="/showToDoItems";
        options.body = "title=office";
        request(app,options, res => {
          th.status_is_ok(res);
          th.body_contains(res,"file sign")
          done();
        })
      });
    });
    describe('POST /editToDoList', () => {
      it('should edit todoList ', (done) => {
        options.method="POST";
        options.url="/editToDoList";
        options.body = `previousTitle=office&newTitle=school
    &description=schoolwork`
        request(app,options, res => {
          th.status_is_ok(res);
          th.body_contains(res, "school")
          done();
        })
      });
    });
  });
  delete process.env.TESTPATH;
});
