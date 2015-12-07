# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

Update to the new history API (#89)

## [1.0.0] - 2015-12-07

### Breaking

The `updatePath(path, noRouterUpdate)` action creator has been removed in favor of
`pushPath(path, state, avoidRouterUpdate)` and `replacePath(path, state, avoidRouterUpdate)`
