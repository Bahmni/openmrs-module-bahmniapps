var bahmni = bahmni || {};

bahmni.tehsilMother = {
    build: function () {
        return {"name": "Bilaspur",
            "parent": {
                "name": "Distr",
                "parent": {
                    "name": "Chattisgarh"
                }
            }
        }
    }
};

bahmni.villageMother = {
    build: function () {
        return {"name": "argaav",
            "parent":  bahmni.tehsilMother.build()
        }
    }
};
