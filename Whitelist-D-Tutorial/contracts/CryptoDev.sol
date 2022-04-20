// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    // _baseTokenURI for computing {tokenURI}.2
    string _baseTokenURI;

    // Whitelist contract instance
    IWhitelist whitelist;

    // boolean to keep track of whether presale started or not
    bool public presaleStarted;

    // timestamp for when presale would end
    uint256 public presaleEnded;

    // total number of tokenIds minted
    uint256 public tokenIds;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused;

    // max number of CryptoDevs
    uint256 public maxTokenIds = 20;

    //  _price is the price of one Crypto Dev NFT
    uint256 public _price = 0.01 ether;

    //modifier for paused
    modifier onlyWhenNotPaused {
        require(!_paused,"contract currently paused");
        _;
        
    }
    

    constructor(string memory baseURI, address whitelistContract)
        ERC721("Crypto Devs", "CD")
    {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        // Set presaleEnded time as current timestamp + 5 minutes
        // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "sale is not running"
        );

        require(
            whitelist.WhitelistedAddress(msg.sender),
            "Yo are not whitelisted"
        );
        require(tokenIds < maxTokenIds, "Exceeds maximum crypto dev supply");
        require(msg.value >= _price, "Ether send is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // this mint function allow user to mint 1 nft per transaction after the presale has ended

    function mint() public payable onlyWhenNotPaused{
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "presale has not been ended yet"
        );
        require(tokenIds < maxTokenIds, "exceed maximum crypto devs supply");
        require(msg.value >= _price, "ether insuffiecient ");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default returned an empty string for the baseURI

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    //   @dev setPaused makes the contract paused or unpaused

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    // withdraw sends all the ether in the contract to the owner of the contract

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,)= _owner.call{value: amount}("");
        require(sent, "failed to send eather");
    }
      // Function to receive Ether. msg.data must be empty
      receive() external payable {}

      // Fallback function is called when msg.data is not empty
      fallback() external payable {}
}
