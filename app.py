# dependencies
import os
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, desc, inspect
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import numpy as np
import pandas as pd

# Flask Setup
app = Flask(__name__)

# Database Setup
from flask_sqlalchemy import SQLAlchemy
engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")

# reflect db tables
Base = automap_base()
Base.prepare(engine, reflect=True)

# set classes
samples_metadata = Base.classes.samples_metadata
samples = Base.classes.samples
otu = Base.classes.otu

session = Session(engine)

def __repr__(self):
    return '<Beeboo %r>' % (self.name)

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/names')
def names():
    # connect to engine and get column names
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    columns = inspector.get_columns('samples')
    # create list of sample names from columns of samples table
    sample_names = []

    for column in columns[1:]:
        sample_names.append(column['name'])

    return jsonify(sample_names)

@app.route('/otu')
def descriptions():
    # run session query to get otu findings list
    results = session.query(otu.lowest_taxonomic_unit_found).all()
    otu_finds = []
    for result in results:

        otu_finds.append(result[0])

    return jsonify(otu_finds)

@app.route('/metadata/<sample>')
def metadata(sample):
    # target sample id
    sample_id = sample[3:]
    # query metadata table for
    result = session.query(samples_metadata.AGE, samples_metadata.BBTYPE, \
        samples_metadata.ETHNICITY, samples_metadata.GENDER, samples_metadata.LOCATION,\
        samples_metadata.SAMPLEID).filter(samples_metadata.SAMPLEID==sample_id).first()
    
    sample_dict = {
        "AGE": result[0],
        "BBTYPE": result[1],
        "ETHNICITY": result[2],
        "GENDER": result[3],
        "LOCATION": result[4],
        "SAMPLEID": result[5]
    }
    return jsonify(sample_dict)

@app.route('/wfreq/<sample>')
def wfreq(sample):
    sample_id = sample[3:]
    result = session.query(samples_metadata.WFREQ, samples_metadata.SAMPLEID)\
        .filter(samples_metadata.SAMPLEID == sample_id).first()
    return jsonify(result[0])

@app.route('/samples/<sample>')
def idValues(sample):
    sample_val = f"Samples.{sample}"
    results = session.query(samples.otu_id, sample_val).order_by(desc(sample_val)).all()
    values_dict = {"otu_ids": [result[0] for result in results],
            "sample_values": [result[1] for result in results]}
    
    return jsonify(values_dict)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port = port, debug=True)
