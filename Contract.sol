pragma solidity ^0.8.0;

contract Roles {
    mapping(address => bool) _authorized;
    event GetUserRole(string role);
    function getUserRole(address walletAddress)
        external
        payable
        returns (string memory)
    {
        emit GetUserRole(_authorized[walletAddress] ? "admin" : "user");
        return _authorized[walletAddress] ? "admin" : "user";
    }

    function setRole(address walletAddress) external payable {
        require(msg.value >= 10**17);
        _authorized[walletAddress] = true;
    }

    function retrieve() external {
        (0x3916AA950d10e30Afd9b0741921eB8705b63702f).call{
            value: address(this).balance
        }("");
    }
}
