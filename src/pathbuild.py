#!/usr/bin/env python
# encoding: utf-8
"""
pathbuild.py

creates paths around various places (TSP)
uses google maps api for distance measurement and 
point-to-point route creation

Created by Benjamin Fields on 2012-01-28.
Copyright (c) 2012 . All rights reserved.
"""

import sys
import os
import unittest
import urllib2
import random
from simplejson import loads
import numpy as np


class PathBuild:
    uri = "http://maps.googleapis.com/maps/api/distancematrix/json?origins={points_list}&destinations={points_list}&sensor=false"
    def __init__(self, points):
        self.points = points
        self.dists = None
    def get_matrix(self):
        if not self.dists:
            points_as_str = '|'.join([','.join([lat,lon]) for (lat,lon) in self.points])
            print "opening", PathBuild.uri.format(points_list=points_as_str)
            raw_matrix = loads(urllib2.urlopen(PathBuild.uri.format(points_list=points_as_str)).read())['rows']
            print raw_matrix
            self.dists = np.zeros((len(self.points),len(self.points)))
            for idx, row in enumerate(raw_matrix):
                print "adding", row, "to", idx
                self.dists[idx] =[item['distance']['value'] for item in row['elements'] if item['status']=='OK']
        return self.dists
    def get_random_path(self):
        return random.sample(self.points, len(self.points))
    def get_optimal_path(self):
        """
        tsp here
        """
        return self.get_random_path()

class PathBuildTests(unittest.TestCase):
    def setUp(self):
        pass


if __name__ == '__main__':
    unittest.main()