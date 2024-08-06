var loginVerifyLoading = document.getElementById('loginVerify');
var loginTitle = document.getElementById('loginTitle');

async function isLogged() {
    loginVerifyLoading.style.display = 'flex';
    // var cookiesDataUser = getCookie('datauser')
    var cookiesDataUser = await window.electronAPI.getLoginAuth();
    // console.log(cookiesDataUser);
    // await window.electronAPI.setLoginAuth('aaaaaaaaaaa');
    var jsonData = cookiesDataUser ? JSON.parse(cookiesDataUser) : null;
    if (!jsonData || !jsonData.id) {
        loginVerifyLoading.style.display = 'none';
        loginTitle.style.color = '#f00';
        loginTitle.innerText = "Faça seu login!"
        return;
    }
    await axios.post('http://172.16.254.253:6100/login', {
        onlyInfo: true,
        login: jsonData.id,
    }).then(async res => {
        // const dataUserCookie = `datauser=${JSON.stringify(res.data.response_data)};max-age=${60 * 60 * 24 * 14};`;
        await window.electronAPI.setLoginAuth(JSON.stringify(res.data.response_data));
        window.location.href = 'index.html';
    }).catch(err => {
        loginVerifyLoading.style.display = 'none';
        console.error(err);
        document.getElementById('loginTitle').innerText = `Erro: ${err.response.data.error} Você não está logado.`
        // deleteCookie('datauser');
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
    await axios.post('http://172.16.254.253:6100/login', {
        login: login.value,
        password: password.value

    }).then(async res => {
        // var expires = new Date('2099-12-31').toGMTString();
        // document.cookie = `datauser=${JSON.stringify(res.data.response_data)};max-age=${999 * 24 * 24 * 999};`;
        await window.electronAPI.setLoginAuth(JSON.stringify(res.data.response_data));
        // setCookie(JSON.stringify(res.data.response_data), 'datauser')


        setTimeout(() => window.location.href = 'index.html', 1000);
    }).catch(err => {
        loginVerifyLoading.style.display = 'none';
        loginTitle.style.color = '#f00';
        try {
            loginTitle.innerText = `Erro: ${err.response.data.error}`
        } catch {
            loginTitle.innerText = `Erro: Erro ao se conectar com o servidor! Verifique se o aparelho Papa-Filas está ligado e funcionando. Se persistir, talvez seja necessário reinicia-lo.`
        }
        return;
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