
var loginVerifyLoading = document.getElementById('loginVerify');
var loginTitle = document.getElementById('loginTitle');


async function isLogged() {
    loginVerifyLoading.style.display = 'flex';
    var cookiesDataUser = getCookie('datauser')
    var jsonData = cookiesDataUser ? JSON.parse(cookiesDataUser) : null;
    console.log(jsonData);
    if (!jsonData || !jsonData.id) {
        loginVerifyLoading.style.display = 'none';
        loginTitle.style.color = '#f00';
        console.log(loginTitle);
        loginTitle.innerText = "Faça seu login!"
        return;
    }
    await axios.post('http://localhost:5400/login', {
        onlyInfo: true,
        login: jsonData.id,
    }).then( res => {
        const dataUserCookie = `datauser=${JSON.stringify(res.data.response_data)};max-age=${60 * 60 * 24 * 14};`;
        window.location.href = '/index.html';
    }).catch( err => {
        loginVerifyLoading.style.display = 'none';
        console.error(err);
        document.getElementById('loginTitle').innerText = `Erro: ${err.response.data.error} Você não está logado.`
        deleteCookie('datauser');
    })
}



isLogged();



async function handleAuth() {
    const login = document.getElementById("loginText");
    const password = document.getElementById("passwordText");

    //Verificação de dados
    if (!login.value || !password.value) {
        return alert('Atenção: Preencha todos os campos!');
    }

    loginVerifyLoading.style.display = 'flex';
    await axios.post('http://localhost:5400/login', {
        login: login.value,
        password: password.value

    }).then(res => {
        const dataUserCookie = `datauser=${JSON.stringify(res.data.response_data)};max-age=${60 * 60 * 24 * 14};`;
        document.cookie = dataUserCookie;
        console.log(res.data.response_data);
        loginVerifyLoading.style.display = 'none';
        window.location.href = '/index.html'
    }).catch(err => {
        loginVerifyLoading.style.display = 'none';
        loginTitle.style.color = '#f00';
        loginTitle.innerText = `Erro: ${err.response.data.error}`
    })
}


// HELPERS

function getCookie(name) {
    // Add the = sign
    name = name + '=';
    // Get the decoded cookie
    var decodedCookie = decodeURIComponent(document.cookie);
    // Get all cookies, split on ; sign
    var cookies = decodedCookie.split(';');
    // Loop over the cookies
    for (var i = 0; i < cookies.length; i++) {
        // Define the single cookie, and remove whitespace
        var cookie = cookies[i].trim();
        // If this cookie has the name of what we are searching
        if (cookie.indexOf(name) == 0) {
            // Return everything after the cookies name
            return cookie.substring(name.length, cookie.length);
        }
    }
}

function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}