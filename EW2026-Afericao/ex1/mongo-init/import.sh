#!/bin/bash
mongoimport --db autoRepair --collection repairs --file /docker-entrypoint-initdb.d/repairs.json --jsonArray
