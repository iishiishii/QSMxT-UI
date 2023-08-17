# QSMxT-UI

# Dependencies

## Build dependencies

- nodejs

  You can install from https://nodejs.org/en/download/

- yarn 

```bash
sudo apt remove cmdtest
sudo apt remove yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update
sudo apt-get install yarn -y
```

```bash
$ node --version
v12.13.0
$ npm --version
6.12.0
```

## sqlite3

```bash
sudo apt-get install libsqlite3-dev
npm install sqlite3 --build-from-source
```

# Install

`npm install`

# Run

```bash
npm run start
```
