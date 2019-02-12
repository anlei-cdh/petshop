pragma solidity ^0.5.0;

contract Adoption {
    // 创建一个地址数组，用来存储领养者与当前宠物的关联信息
    address[16] public adopters;

    // 此函数用来实现宠物的领养功能（写区块的操作，不会返回结果数据，只会返回交易信息）
    function adopt(uint petId) public {
        // 判断当前petId的合法性
        require(petId>=0 && petId<=15);
        // 存储当前领养人的地址信息
        adopters[petId] = msg.sender;
        // 最后返回被领养者的PetId，写数据就不需要返回值了
        // return petId;
    }

    // 检索领养者的地址信息(仅仅是读取区块链数据，则当前函数需要添加constant 0.5改为view了)
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}
