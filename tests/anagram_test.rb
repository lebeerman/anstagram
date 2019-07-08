#!/usr/bin/env ruby

require 'json'
require_relative 'anagram_client'
require 'test/unit'

# capture ARGV before TestUnit Autorunner clobbers it

class TestCases < Test::Unit::TestCase

  # runs before each test
  def setup
    @client = AnagramClient.new(ARGV)

    # add words to the dictionary
    @client.post('/words.json', nil, {"words" => ["read", "dear", "dare"] }) rescue nil
  end

  # runs after each test
  def teardown
    # delete everything
    @client.delete('/words.json') rescue nil
  end

  def test_adding_words
    # MODIFIED TEST - data store integrety should prevent duplicate entries.
    teardown
    res = @client.post('/words.json', nil, {"words" => ["read", "dear", "dare"] })
    assert_equal('201', res.code, "Unexpected response code")

    # Verify API dissallows for duplicate words in the store
    res = @client.post('/words.json', nil, {"words" => ["read", "dear", "dare"] })
    assert_equal('500', res.code, "Prevent Duplicate Entries in the data store")
  end

  def test_fetching_anagrams

    # fetch anagrams
    res = @client.get('/anagrams/read.json')

    assert_equal('200', res.code, "Unexpected response code")
    assert_not_nil(res.body)

    body = JSON.parse(res.body)

    assert_not_nil(body['anagrams'])

    expected_anagrams = %w(dare dear)
    assert_equal(expected_anagrams, body['anagrams'].sort)
  end

  def test_fetching_anagrams_with_limit

    # fetch anagrams with limit
    res = @client.get('/anagrams/read.json', 'limit=1')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(1, body['anagrams'].size)
  end

  def test_fetch_for_word_with_no_anagrams

    # fetch anagrams with limit
    res = @client.get('/anagrams/zyxwv.json')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(0, body['anagrams'].size)
  end

  def test_deleting_all_words

    res = @client.delete('/words.json')

    assert_equal('204', res.code, "Unexpected response code")

    # should fetch an empty body
    res = @client.get('/anagrams/read.json')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(0, body['anagrams'].size)
  end

  def test_deleting_all_words_multiple_times

    3.times do
      res = @client.delete('/words.json')

      assert_equal('204', res.code, "Unexpected response code")
    end

    # should fetch an empty body
    res = @client.get('/anagrams/read.json', 'limit=1')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(0, body['anagrams'].size)
  end

  def test_deleting_single_word

    # delete the word
    res = @client.delete('/words/dear.json')

    assert_equal('204', res.code, "Unexpected response code")

    # expect it not to show up in results
    res = @client.get('/anagrams/read.json')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(['dare'], body['anagrams'])
  end

  def test_deleting_word_by_anagram

    # delete the word
    res = @client.delete('/anagrams/dear.json')

    assert_equal('200', res.code, "Unexpected response code")

    # expect it not to show up in results
    res = @client.get('/anagrams/read.json')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(0, body['anagrams'].size)
  end

  def test_get_anagrams_by_group

    # get groups of anagrams greater than 3, not testing the opbject values for correctness though
    res = @client.get('/anagrams/groups?size=3')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(1, body['anagramGroups'].size)

    # get groups of anagrams greater than 5
    res = @client.get('/anagrams/groups?size=5')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal([], body['anagramGroups'])
  end

  def test_get_verify_words_are_anagrams

    # get groups of anagrams greater than 3, not testing the opbject values for correctness though
    res = @client.post('/anagrams/verify/words.json', nil, {"words" => ["read", "dear", "dare"] })

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(true, body['anagramStatus'])

    res = @client.post('/anagrams/verify/words.json', nil, {"words" => ["read", "dear", "daeeee"] })

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(false, body['anagramStatus'])

  end

  def test_get_word_with_most_anagrams

    # gets an array of words with the most anagrams
    res = @client.get('/anagrams/max')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_not_nil(body['mostAnagrams'])

    expected_anagrams = %w(dare dear read)
    assert_equal(expected_anagrams, body['mostAnagrams'].sort)

  end

  def test_fetching_anagrams_with_proper_noun_control

    @client.post('/words.json', nil, {"words" => ["Read", "Dear", "Dare"] })

    # fetch anagrams with limit
    res = @client.get('/anagrams/read.json', 'noun=true')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_equal(["dear", "dare", "Read", "Dear", "Dare"], body['anagrams'])
  end

  def test_get_info_on_words_in_store
    # gets an array of words with the most anagrams
    res = @client.get('/words/info')

    assert_equal('200', res.code, "Unexpected response code")

    body = JSON.parse(res.body)

    assert_not_nil(body['info'])

    assert_equal(["avg","count","max", "median", "min"], body['info'].keys.sort)

  end

end
