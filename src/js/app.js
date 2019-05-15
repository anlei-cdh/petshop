App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load PetInfo
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
    // 初始化web3
    if (typeof web3 !== 'undefined') {
      // 有钱包的时候执行这里
      App.web3Provider = web3.currentProvider;
      console.info("if...");
      console.info(App.web3Provider);
    } else {
      // 连接私有链
      App.web3Provider = new Web3.providers.HttpProvider('http://192.168.137.71:9545');
      console.info("else...");
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);
      console.info("App.contracts.Adoption: " + App.contracts.Adoption);
      return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },
  markAdopted: function() {
    console.info("markAdopted......");
    var AdoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      AdoptionInstance = instance;
      return AdoptionInstance.getAdopters();
    }).then(function(adopters) {
      for(i=0;i<adopters.length;i++) {
        if(adopters[i] != "0x0000000000000000000000000000000000000000") {
          console.info(adopters[i]);
          $(".panel-pet").eq(i).find("button").text("完成").attr("disabled",true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  handleAdopt: function(event) {
    var petId = parseInt($(event.target).data('id'));
    console.info("petId: " + petId);
    var AdoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
        AdoptionInstance = instance;
        return AdoptionInstance.adopt(petId);
      }).then(function(result) {
        console.info(result);
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
