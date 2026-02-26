const http = require('http');

const data = JSON.stringify({
  username: 'ernestine',
  password: 'me'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Signup Status Code:', res.statusCode);
    console.log('Signup Response:', body);
    
    // Test login after signup
    const loginData = JSON.stringify({
      username: 'ernestine',
      password: 'me'
    });
    
    const loginReq = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (loginRes) => {
      let loginBody = '';
      
      loginRes.on('data', (chunk) => {
        loginBody += chunk;
      });
      
      loginRes.on('end', () => {
        console.log('\nLogin Status Code:', loginRes.statusCode);
        console.log('Login Response:', loginBody);
        
        process.exit(0);
      });
    });
    
    loginReq.write(loginData);
    loginReq.end();
  });
});

req.write(data);
req.end();
