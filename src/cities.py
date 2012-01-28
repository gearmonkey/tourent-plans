#!/usr/bin/env python
# encoding: utf-8
"""
cities.py

Grabs city data (torrents from the semetric api) for an arbitrary artist (via and id method)

optionally filters by country or continent

Created by Benjamin Fields on 2012-01-28.
Copyright (c) 2012
"""

import sys
import os
import unittest
import urllib2
from simplejson import loads
import credentials #api keys in here

class Cities:
    def __init__(self, artist):
        self.artist = artist
        self.by_torrent = None
    
    def get_top_by_torrent(self, country=None, continent=None):
        """
        returns the top cities by torrent, fetch them from semetric if not already cached
        can filter the country or continent by any iso code (eg "GB" for the United Kingdom or "EU" for Europe)
        """
        if not self.by_torrent:
            uri = "http://api.semetric.com/artist/{artistID}/downloads/bittorrent/location/city?token={key}"
            self.by_torrent = loads(urllib2.urlopen(\
                uri.format(artistID=self.artist,
                         key=credentials.semetric_api)).read())['response']['data']
        cities = self.by_torrent
        if country:
            cities = [city for city in cities if city['city']['region']['country']['code']==country]
        elif continent:
            cities = [city for city in cities if city['city']['region']['continent']['code']==continent]
        return cities 

class citiesTests(unittest.TestCase):
    def setUp(self):
        pass


if __name__ == '__main__':
    unittest.main()