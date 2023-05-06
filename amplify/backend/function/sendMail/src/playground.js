const { CognitoJwtVerifier } = require("aws-jwt-verify");

async function main() {

  const token = "eyJraWQiOiIrOWF4a2t5a25yd3VDKytZU0YxSDlDMU9LOFhLZVdhYjhDY1F4VUp1N2VvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0OTY3YjVkMC0zZmIyLTQ2MDktYmQ5NS1kNGJjNDU2YThhOWEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfcGdycVk0M1dlIiwiY29nbml0bzp1c2VybmFtZSI6IjQ5NjdiNWQwLTNmYjItNDYwOS1iZDk1LWQ0YmM0NTZhOGE5YSIsIm9yaWdpbl9qdGkiOiJmODZkYjgzNy05YzNjLTQ0OTktYjNhMi1hZDM1Njk2ZjI5OWEiLCJhdWQiOiIzbTd1YWU0djBlZHM2ZHFnbG9qbzlpZTJnYiIsImV2ZW50X2lkIjoiNDlhM2YxZGItNzkxZi00YTFlLWIwNWUtZWFlNjJiMjBjMTJhIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2ODMzODM3ODgsImV4cCI6MTY4MzM4NzM4OCwiaWF0IjoxNjgzMzgzNzg4LCJqdGkiOiJlNTRjYzAwMS01NGM0LTQ5MWYtODMxNi1jNmMyYWM0OTViOWMiLCJlbWFpbCI6Im1hcmNvc3VhcmV6cDk1QGdtYWlsLmNvbSJ9.mEo3RCoCualLSTF0xsMj2sedTxkRB9YECSR6haxcBKKQ_8pQ8NXCrDdHOZGYRGbDhV8DJaYU5DP1dGD4f2pQ1W_oOpWSBiZdCD31S3MOJmTrkbT1KCjjhHmqcSAWjy7yt8mA63RIOWshWMtvRg2-wdgFYTq15r6FUpy2bCi-q61nT62L4Snnee5zXLYGibuX5fjSJFN_-jO56xBcVD2qUUsBoR8PhLoXXqQ_cFINu4TuWDdlt-20WYp-KynBypF4HF6uqRcIoipYsHgB8EPwIElGVsQes1lSCPj5_-AlW2dYzZh0Nqrjofoi-l7O74yEfZoppuxlB-5YVQ8WmSGGEA";

  const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_pgrqY43We",
    tokenUse: "id",
    clientId: "3m7uae4v0eds6dqglojo9ie2gb",
  });

  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);
  } catch(err) {
    console.log("Token not valid!", err);
  }
}

main();