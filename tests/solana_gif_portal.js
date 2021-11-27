const anchor = require("@project-serum/anchor");

const { SystemProgram, Keypair } = anchor.web3;
const { BN, Provider } = anchor;

const main = async () => {
  console.log("🚀 Starting test...");

  // Create and set the provider. We set it before but we needed to update it, so that it can communicate with our frontend.
  const provider = Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaGifPortal;

  // Create an account keypair for our program to use
  const baseAccount = Keypair.generate();

  const tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  console.log("📝 Your transaction signature", tx);

  // Fetch data from the account
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString());

  await program.rpc.addGif("https://media.giphy.com/media/ZAqgvIkbGPWyE4bY0v/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    }
  });

  // Fetch data from the account to see what changed.
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString());
  console.log('👀 GIF List', account.gifList);

  // Upvote
  console.log('👀 First GIF *before* upvote', account.gifList[0]);
  await program.rpc.upvoteGif(account.gifList[0].gifLink, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    }
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 First GIF *after* upvote', account.gifList[0]);

  // Send tip
  let senderBalance = await program.provider.connection.getBalance(provider.wallet.publicKey);
  let receiverAccount = Keypair.generate();
  let receiverBalance = await program.provider.connection.getBalance(receiverAccount.publicKey);
  let amountToSend = 1.337.toString();
  console.log("👀 Assets before the tip. Sender: %o lamports. Receiver: %o lamports. Sending: %o SOL", senderBalance, receiverBalance, amountToSend);

  await program.rpc.tip(amountToSend, {
    accounts: {
      from: provider.wallet.publicKey,
      to: receiverAccount.publicKey,
      systemProgram: SystemProgram.programId,
    }
  });

  let delta = senderBalance - await program.provider.connection.getBalance(provider.wallet.publicKey);
  senderBalance = await program.provider.connection.getBalance(provider.wallet.publicKey);
  receiverBalance = await program.provider.connection.getBalance(receiverAccount.publicKey);
  console.log("👀 Assets after the tip. Sender: %o lamports. Receiver: %o lamports. Delta: %o lamports", senderBalance, receiverBalance, delta);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

runMain();
