DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# handle environment file
set -a
. $DIR/../.env
set +a

npx babel-watch ${DIR}/deleteTemplates.js