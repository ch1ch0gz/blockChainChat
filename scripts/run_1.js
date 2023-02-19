const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();
  console.log("Contract addy:", waveContract.address);

  const [signer, randomPerson, randomPerson2] = await hre.ethers.getSigners();

  let waveTxn = await waveContract.wave("Hola!", randomPerson.address);
  await waveTxn.wait();


  waveTxn = await waveContract.connect(randomPerson).wave("Hola!, que tal?", signer.address);
  await waveTxn.wait();

  waveTxn = await waveContract.wave("Muy Bien", randomPerson.address);
  await waveTxn.wait();

  waveTxn = await waveContract.connect(randomPerson2).wave("Te conozco??", randomPerson.address);
  await waveTxn.wait();

  let checkWaves = await waveContract.wavesPerUser();
  await waveTxn.wait();

  console.log(checkWaves);

};


const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain()
