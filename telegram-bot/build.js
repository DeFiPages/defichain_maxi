const util = require('util')
const exec = util.promisify(require('child_process').exec)

console.log("building telegram-bot")

function handleExec(res) {
  if (res.stderr) {
    console.error(res.stderr)
  }

  if (res.error) {
    console.log(res.error.message)
    throw res.error
  }
  console.log(res.stdout)
}

/**
 * Build and ZIP for AWS Lambda Execution
 */
async function buildLambda() {
  const file = "telegram-bot"
  {
    const command = `npx --package @vercel/ncc ncc build ./src/${file}.ts --source-map -o ./dist/${file}`
    const res = await exec(command, { cwd: __dirname })
    handleExec(res)
  }

  {
    const res = await exec(`zip -r -j ./dist/${file}.zip ./dist/${file}/*`)
    handleExec(res)
  }

  console.log(`src/${file}.ts -> dist/${file}.zip`)
}

buildLambda().catch(
  e => {
    console.error(e)
  }
)