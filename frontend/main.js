document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;

      try {
        const res = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role }),
        });

        const data = await res.json();
        if (res.ok) {
          alert('Signup successful! Please login.');
          window.location.href = 'login.html';
        } else {
          alert(data.message || 'Signup failed.');
        }
      } catch (err) {
        console.error(err);
        alert('Signup failed. Check console.');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          alert('Login successful!');
          if (data.role === "admin"){
            window.location.href = 'admin.html';
          }
          if (data.role === "customer"){
            window.location.href = 'index.html';
          }
        } else {
          alert(data.message || 'Login failed.');
        }
      } catch (err) {
        console.error(err);
        alert('Login failed. Check console.');
      }
    });
  }
});

