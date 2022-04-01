pragma solidity ^0.8.0;

contract Roles {
    mapping(address => bool) _authorized;

    function getUserRole(address walletAddress)
        external
        view
        returns (string memory)
    {
        return _authorized[walletAddress] ? "admin" : "user";
    }

    function setRole(address walletAddress) external payable {
        require(msg.value >= 10**17);
        _authorized[walletAddress] = true;
    }

    function retrieve() external {
        (0x412f2182BFBCd943821CE6908Ec456e9ef52e8fc).call{
            value: address(this).balance
        }("");
    }
}
