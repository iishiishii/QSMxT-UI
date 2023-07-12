# QSMxT-UI

# Dependencies

## Node v12.13

```bash
mkdir nodejs12
cd nodejs12/
wget https://nodejs.org/dist/v12.13.0/node-v12.13.0-linux-x64.tar.xz
tar xf node-v12.13.0-linux-x64.tar.xz
rm node-v12.13.0-linux-x64.tar.xz
echo "export PATH=`pwd`/node-v12.13.0-linux-x64/bin:${PATH}" >> ~/.bashrc
source ~/.bashrc
```
```bash
$ node --version
v12.13.0
$ npm --version
6.12.0
```

## sqlite3

```bash
cd api/
sudo apt-get update
sudo apt-get install libsqlite3-dev
npm install sqlite3 --build-from-source
```

# Install

Install via `setup.sh`.

# Run

Run via `qsmxt`.

