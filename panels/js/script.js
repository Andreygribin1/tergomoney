(function(){
  const blockAuth = document.querySelector('#auth');
  const fieldApiKey = document.querySelector('input[name="api_key"]');
  const fieldShopId = document.querySelector('input[name="shop_id"]');
  const fieldSecretKey = document.querySelector('input[name="secret_key"]');
  const buttonAuth = document.querySelector('button#Authorization');

  const blockOrderCreate = document.querySelector('#orderCreate');
  const fieldCurrency = document.querySelector('select[name="currency"]');
  const fieldAmount = document.querySelector('input[name="amount"]');
  const buttonCreate = document.querySelector('button#create');

  const listTbody =document.querySelector('#lists tbody');

  let authData;

  chrome.storage.local.get(function(data){
    if(data.auth){
      fieldShopId.value = data.auth.shop_id;
      fieldApiKey.value = data.auth.api_key;
      fieldSecretKey.value = data.auth.secret_key;
      buttonAuth.innerText = 'Изменить';
      blockOrderCreate.classList.remove('none');
      authData = data.auth;
    }
  })


  function auth(params) {
    return new Promise(async(resolve) => {
        try{
          let data = {
              'shop_id': params.shop_id,
              'nonce': new Date().getTime() / 1000
          };


          let body = JSON.stringify(data);

          let sign =sha256.hmac(params.api_key, body);
          let response = await fetch('https://tegro.money/api/balance/', {
            method: 'POST',
            body,
            headers: {
              'Authorization': `Bearer ${sign}`,
              'Content-Type': 'application/json'
            }
          });
          let res = await response.json();
          resolve(res);


      }catch(err){
        resolve({
          data: [],
          desc: "Exception error",
          type: "error"
        });
      }
    });
  }




  function createPay(params) {

        if(authData === null) {
          resolve({
            data: [],
            desc: "Not Authorization",
            type: "error"
          });
        }


          let data = {
            'amount': parseInt(params.amount),
            'currency': params.currency, //RUB/USD/EUR,
              'order_id': String(new Date().getTime()),
              'shop_id': authData.shop_id,



            };


          let str = '', arr = [];

          for(let name in data){
            arr.push(`${name}=${data[name]}`);
          }

          str = arr.join('&');
          console.log(str, authData.secret_key);
          let sign = md5(str + authData.secret_key);

          data['sign'] = sign;
          return data;




  }




  buttonAuth.addEventListener('click', async function(){
    let inputs = Array.from(blockAuth.querySelectorAll('input')).reduce((acc, node) => ({...acc, [node.name]: node.value.trim()}), {});
    for(let name in inputs){
      if(blockAuth.querySelector(`input[name="${name}"]`) && blockAuth.querySelector(`input[name="${name}"]`).value.trim() === ''){
        blockAuth.querySelector(`input[name="${name}"]`).classList.add('is-invalid');
        return false;
      }else{
        blockAuth.querySelector(`input[name="${name}"]`).classList.remove('is-invalid');
      }
    }

    let res = await auth(inputs);
    if('type' in res && 'desc' in res && res['type'] === 'error'){
      showError('#validationAuthFeedback', res['desc']);
      return false;
    }

    chrome.storage.local.set({ auth: inputs});
    buttonAuth.innerText = 'Изменить';
    blockOrderCreate.classList.remove('none');

  })


  buttonCreate.addEventListener('click', async function(){
    let inputs = Array.from(blockOrderCreate.querySelectorAll('input, select')).reduce((acc, node) => ({...acc, [node.name]: node.value.trim()}), {});
    for(let name in inputs){
      if(blockOrderCreate.querySelector(`*[name="${name}"]`) && blockOrderCreate.querySelector(`*[name="${name}"]`).value.trim() === ''){
        blockOrderCreate.querySelector(`*[name="${name}"]`).classList.add('is-invalid');
        return false;
      }else{
        blockOrderCreate.querySelector(`*[name="${name}"]`).classList.remove('is-invalid');
      }
    }


    let res =  createPay(inputs);
    createElement(res);
    addLists(res);
  });

  function addLists(add){
    chrome.storage.local.get(['lists'], function(data){
      let lists = [];
      if(data.lists){
        lists = data.lists;
      }
      add['time'] = new Date().toLocaleString();
      lists.unshift(add);
      chrome.storage.local.set({lists}, function(){
        renderList();
      });

    })
  }

  function removeList(order_id){
    chrome.storage.local.get(['lists'], function(data){
      let lists_new = [];
      if(data.lists){
        for(let item of data.lists){
          if(item['order_id'] !== order_id){
            lists_new.push(item);
          }
        }
      }


      chrome.storage.local.set({lists: lists_new}, function(){
        renderList();
      });

    })
  }

  function renderList(){

    chrome.storage.local.get(['lists'], function(data){
      let str = '';

      if(data.lists){
        for(let key in data.lists){
          str += `<tr>
            <th scope="row">${key + 1}</th>
            <td><button class="btn btn-primary" data-open='${JSON.stringify(data.lists[key])}'>Открыть</button></td>
            <td>${data.lists[key]['time']}</td>
            <td>
              <button type="button"  class="btn btn-danger" data-delete="${data.lists[key]['order_id']}">Удалить</button>
            </td>
          </tr>`;
        }
      }

      listTbody.innerHTML = str;
    })

  }

  renderList();

  listTbody.addEventListener('click', function(e) {
    if(e.target.hasAttribute('data-open')){
      let data = JSON.parse(e.target.dataset.open);
      delete data['time'];
      createElement(data);
    }else if(e.target.hasAttribute('data-delete')){
      removeList(e.target.dataset.delete);
    }
  })


  function createElement(data){
    let form = document.createElement('form');
    form.action = 'https://tegro.money/pay/form/';
    form.method = 'POST';
    form.target = "_blank";
    for(let name in data){
      form.innerHTML += ` <input type="hidden" name="${name}" value="${data[name]}">`;
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }




  function showError(selector, message){
    if(document.querySelector(selector) !== null) {

      document.querySelector(selector).innerText = message;
      document.querySelector(selector).classList.add('show');

      setTimeout(() => {
        document.querySelector(selector).classList.remove('show');
      }, 2000);
    }
  }


})();
