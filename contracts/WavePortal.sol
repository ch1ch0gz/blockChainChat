// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

/** @title A blockchain chat contract
  * @author ch1ch0gz
  * @notice This is my first smart contract, lots of improvements to be made
  * @dev Contract under development to allow payment with ERC20, and NFT farming on JPEG'd
*/
import "@openzeppelin/contracts/access/Ownable.sol";

contract WavePortal is Ownable{
    uint256 totalWaves;

    event NewWave(address indexed from,address indexed to, uint256 timestamp, string message);

    /**
      * @dev This struct provides the message definition
    */

    struct Wave {
        address waver;
        address receiver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    /**
      * @dev mapping to have timestamp of the last message
    */
    mapping(address => uint256) public lastWavedAt;

    /**
      * @dev mapping to have number of messages per user
    */
    mapping(address => uint256) public numberWavesPerUser;

    constructor()  Ownable(){}

    /**
      * @dev This function that allows to send a messagge to a contact
      * @param _message is the message and _receiver is the receiver of the message
      * @return writes the message in a mapping and sends and event out
    */
    function wave(string memory _message, address _receiver) public {

       require(lastWavedAt[msg.sender] + 30 seconds < block.timestamp, "Must wait 30 seconds before waving again.");

       lastWavedAt[msg.sender] = block.timestamp;
       totalWaves++;
       numberWavesPerUser[msg.sender]++;
       numberWavesPerUser[_receiver]++;
       waves.push(Wave(msg.sender,_receiver, _message, block.timestamp));

       emit NewWave(msg.sender,_receiver, block.timestamp, _message);

    }

    function wavesPerUser() public view returns (Wave[] memory) {
      uint256 wavesLength =  waves.length;
      Wave[] memory wavesUser = new Wave[](numberWavesPerUser[msg.sender]);
      uint256 j = 0;
      for (uint256 i=0; i < wavesLength; i++) {
        if( (waves[i].waver == msg.sender) || (waves[i].receiver == msg.sender)) {
            wavesUser[j] = Wave(waves[i].waver,waves[i].receiver,waves[i].message,waves[i].timestamp);
            j++;
          }
      }

      return wavesUser;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }
}
