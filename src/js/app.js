App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // 初始化web3对象，并且设置私有链
    if (typeof web3 !== 'undefined') { // 如果安装钱包会执行if这段代码
      // 获取当前已存在的web3对象，有钱包的时候执行if语句
      App.web3Provider = web3.currentProvider; // 钱包连接的私有链，与项目部署的私有链一定要相同
      console.info("if...");
      console.info(App.web3Provider);
    } else {
      // 指定单前要连接的私有链，并且创建web3对象
      App.web3Provider = new Web3.providers.HttpProvider('http://192.168.137.71:9545');
      console.info("else...");
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  // 此函数用来加载智能合约的json文件
  initContract: function() {
    // 需要创建一个智能合约并且名称为 Adoption.sol
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var AdoptionArtifact = data;
      // TruffleContract已经在truffle-contract中定义
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      // 设置当前智能合约所关联的私有链
      App.contracts.Adoption.setProvider(App.web3Provider);
      console.info("App.contracts.Adoption: " + App.contracts.Adoption);
      // 初始化宠物领养的信息
      return App.markAdopted();
    });
    // 给按钮注册事件
    return App.bindEvents();
  },

  bindEvents: function() {
    // 给页面的按钮注册单机事件
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },
  // 给被领养的宠物设置标记
  markAdopted: function() {
    console.info("markAdopted......");
    // 1. 获取智能合约
    var AdoptionInstance; // 此变量会用来存储智能合约的实例
    App.contracts.Adoption.deployed().then(function(instance) {
      AdoptionInstance = instance; // 获取智能合约对象
      // 调用方法，返回宠物对应的领养人地址
      return AdoptionInstance.getAdopters();
    }).then(function(adopters) {
      // 根据宠物被领养的状态来修改按钮
      for(i=0;i<adopters.length;i++) {
        if(adopters[i] != "0x0000000000000000000000000000000000000000") {
          // console.info("成功......");
          console.info(adopters[i]);
          $(".panel-pet").eq(i).find("button").text("完成").attr("disabled",true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  // 主要实现宠物领养的功能
  handleAdopt: function(event) {
    // event.preventDefault();

    // 获取被领养宠物的petID
    var petId = parseInt($(event.target).data('id'));
    console.info("petId: " + petId);
    // 实例化智能合约
    var AdoptionInstance; // 此变量会用来存储智能合约的实例
    // web3.eth.getAccounts是同步方式，此处是异步方式
// web3.eth.getAccounts(function(error, accounts) {
//   if (error) {
//     console.log(error);
//   }
//   // 默认获取第一个账户也就是缺省账户
//   var account = accounts[0];
//   console.info("account: " + account);
      // 实例化智能合约对象
      // 每一个抽象出来的合约接口都有一个deployed()方法
      App.contracts.Adoption.deployed().then(function(instance) {
        AdoptionInstance = instance; // 获取智能合约对象
        // 调用领养的方法，主要实现宠物领养的功能，{from:account}是额外的参数
// return AdoptionInstance.adopt(petId,{from:account});
        return AdoptionInstance.adopt(petId);
      }).then(function(result) {
        console.info(result);
        // 修改按钮状态
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
// });

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
