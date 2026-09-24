---
title: "Pairing Elixir with Cheese, Part II: In Search of Something Salty"
slug: pairing-elixir-with-cheese-ii
date: 2026-09-25T09:00:00+03:00
categories:
  - Tech & Tools
tags:
  - elixir
  - livebook
  - ai
  - llm
  - openai
  - embeddings
  - semantic-search
  - cosine-similarity
  - cheese
summary: "I tried embeddings to make my cheese catalog searchable by meaning, then discovered similarity isn't the same as a good pairing."
description: "A follow-up Elixir tutorial: building semantic search over a cheese catalog with OpenAI embeddings and cosine similarity, then finding its limits with an LLM-based pairing recommender."
series:
  - elixir-and-cheese
series_order: 2
code:
  maxShownLines: 999
draft: true
---

In [part one](https://www.dewofyouryouth.com/post/pairing-elixir-with-cheese/), I assembled a small Hall of Cheeses, persuaded an LLM to fill in the tasting notes, and wrote a function that finds cheeses whose pairing lists contain a given string. It works splendidly if I search for `red wine`. It is less helpful if I search for `cabernet`, which the catalog has never heard of.

I ended that post promising a more sophisticated search. Naturally, I tried embeddings. What follows is a record of me finding a perfectly reasonable answer to a question I hadn't quite meant to ask. When I say I want something that goes with `salty`, I mean I have something salty to eat and need a cheese to serve alongside it. This distinction will take me longer to notice than it should.

The cells below pick up where the [first notebook](/post/pairing-elixir-with-cheese/) left off. They assume `cheesy_goodness` is a list of `%CheeseStruct{}` values, Req is installed, and my Livebook secret is available as `LB_OPEN_API_KEY`.

## Teaching the Catalog to Search by Meaning

An embedding turns a piece of text into a list of numbers. Texts with related meanings tend to land near each other in that numerical space. We can embed each item in `pairs_well_with`, embed a search term, and rank the pairings by cosine similarity. For six cheeses, this is rather more machinery than the cheese board strictly requires. That is, of course, part of the appeal.

```elixir
defmodule CheeseSearch do
  # Turn the cheese catalog into searchable entries.
  # Each pairing gets its own entry and embedding.
  def build_index(catalog) do
    entries =
      Enum.flat_map(catalog, fn %CheeseStruct{} = cheese ->
        Enum.map(cheese.pairs_well_with, fn pairing ->
          %{cheese: cheese, pairing: pairing}
        end)
      end)

    if entries == [] do
      []
    else
      # Send all pairing texts in one API request.
      vectors = embed(Enum.map(entries, & &1.pairing))

      # Attach each returned vector to its original pairing.
      Enum.zip(entries, vectors)
      |> Enum.map(fn {entry, vector} ->
        Map.put(entry, :vector, vector)
      end)
    end
  end

  # Return up to `limit` cheeses, ranked by similarity to the query.
  def search(index, query, limit \\ 3) do
    # The query must be embedded with the same model as the pairings.
    [query_vector] = embed([query])

    index
    |> Enum.map(fn entry ->
      %{
        cheese: entry.cheese,
        matching_pairing: entry.pairing,
        score: cosine_similarity(query_vector, entry.vector)
      }
    end)
    # Put the closest pairing first.
    |> Enum.sort_by(& &1.score, :desc)
    # A cheese may have several pairings. Keep only its best match.
    |> Enum.uniq_by(& &1.cheese.name)
    |> Enum.take(limit)
  end

  # Ask OpenAI to turn a batch of strings into numeric vectors.
  defp embed(texts) do
    response =
      Req.post!("https://api.openai.com/v1/embeddings",
        headers: [
          authorization: "Bearer #{System.fetch_env!("LB_OPEN_API_KEY")}"
        ],
        json: %{
          model: "text-embedding-3-small",
          input: texts,
          encoding_format: "float"
        }
      )

    case response do
      %{status: 200, body: %{"data" => data}} ->
        # Use the API's index field to restore input order before
        # matching vectors with their original pairing texts.
        data
        |> Enum.sort_by(& &1["index"])
        |> Enum.map(& &1["embedding"])

      %{status: status, body: body} ->
        raise "Embedding request failed (#{status}): #{inspect(body)}"
    end
  end

  # Measure how close two vectors point in embedding space.
  # A higher score means the texts are more similar to the model.
  defp cosine_similarity(a, b) do
    dot =
      Enum.zip(a, b)
      |> Enum.reduce(0.0, fn {x, y}, sum -> sum + x * y end)

    length_a = :math.sqrt(Enum.reduce(a, 0.0, fn x, sum -> sum + x * x end))
    length_b = :math.sqrt(Enum.reduce(b, 0.0, fn x, sum -> sum + x * x end))

    dot / (length_a * length_b)
  end
end
```

There are two API steps here. `build_index/1` embeds all the pairing strings in one batch; `search/3` embeds the new query. The arithmetic after that happens in Elixir. I keep the index in its own Livebook cell so I can try another query without regenerating every cheese vector.

```elixir
# Do this once for the current catalog.
cheese_index = CheeseSearch.build_index(cheesy_goodness)
```

Now, what happens if I ask for a cabernet?

```elixir
# Try different queries without rebuilding the index.
CheeseSearch.search(cheese_index, "cabernet")
```

This is the trick I wanted: a query can retrieve a related phrase even when the exact word doesn't occur in the list. It is a **ranking**, though, not a ruling from an accredited cheese authority. The function always returns up to three cheeses, even if the third result is a rather heroic stretch.

## A Salty Problem

Let’s search for `salty`. I am imagining a salty snack in need of a cheese.

```elixir
CheeseSearch.search(cheese_index, "salty")
```

My run put Parmesan first because `"Soup"` was its nearest pairing; Brie came up through `"honey"`, and Swiss through `"Pickles"`. But I wasn't asking for a food whose name is semantically near *salty*. I had a salty food in mind and wanted to know which cheese would go well **with it**. Even if pickles happen to be salty, a similarity score between `"salty"` and `"Pickles"` doesn't tell me why Swiss would be the right cheese for my snack. Nor does `"honey"` tell me that Brie would be wrong: sweetness might be exactly the contrast I want.

The search was working exactly as designed. It just wasn't designed to answer the question I was actually asking.

## Similar Is Not the Same as Good Together

Suppose I have salty pretzels and want to know which cheese to serve with them. A search for *similar* flavors might favor a salty cheese. But a good pairing could instead use creaminess to soften the salt, acidity to cut the richness, or a sharper flavor that stands up to the pretzel. Likewise, honey may work with a salty cheese because the flavors contrast. `"Pretzels"` appearing in a pairing list would be useful evidence, but its absence tells me very little. Those lists were improvised by an LLM in the first place.

That is a different job. Instead of retrieving text near `"salty"` in embedding space, I can give the model the whole six-cheese catalog and ask it to recommend a cheese for my snack, with reasons. At this size I do not need a vector database, or even an index. I need to ask a better question.

```elixir
defmodule CheeseRecommender do
  def recommend(catalog, food) when is_list(catalog) and is_binary(food) do
    # Send only the fields needed to make a pairing recommendation.
    cheese_data =
      Enum.map(catalog, fn %CheeseStruct{} = cheese ->
        %{
          name: cheese.name,
          flavor_profile: cheese.flavor_profile,
          pairs_well_with: cheese.pairs_well_with
        }
      end)

    schema = %{
      type: "object",
      properties: %{
        recommendations: %{
          type: "array",
          items: %{
            type: "object",
            properties: %{
              name: %{type: "string"},
              reason: %{type: "string"}
            },
            required: ["name", "reason"],
            additionalProperties: false
          }
        }
      },
      required: ["recommendations"],
      additionalProperties: false
    }

    response =
      Req.post!("https://api.openai.com/v1/responses",
        headers: [
          authorization: "Bearer #{System.fetch_env!("LB_OPEN_API_KEY")}"
        ],
        json: %{
          model: "gpt-4o-mini",
          input: """
          Recommend up to three cheeses from the catalog to serve with #{food}.

          Consider how flavors and textures complement or contrast with the food.
          A good pairing does not need to have similar flavors. Treat the existing
          pairs_well_with lists as suggestions, not exhaustive rules.

          Use only cheese names from this catalog. Rank your choices best first.
          Give a brief, specific reason for each choice.

          Catalog:
          #{Jason.encode!(cheese_data)}
          """,
          text: %{
            format: %{
              type: "json_schema",
              name: "cheese_recommendations",
              strict: true,
              schema: schema
            }
          }
        }
      )

    %{status: 200, body: body} = response

    json_text =
      Enum.find_value(body["output"], fn
        %{"type" => "message", "content" => content} ->
          Enum.find_value(content, fn
            %{"type" => "output_text", "text" => text} -> text
            _ -> nil
          end)

        _ ->
          nil
      end)

    %{"recommendations" => recommendations} = Jason.decode!(json_text)

    # Convert the model's cheese names back into your actual structs.
    cheeses_by_name =
      Map.new(catalog, fn cheese ->
        {String.downcase(cheese.name), cheese}
      end)

    recommendations
    |> Enum.take(3)
    |> Enum.map(fn %{"name" => name, "reason" => reason} ->
      cheese =
        Map.fetch!(
          cheeses_by_name,
          String.downcase(name)
        )

      %{cheese: cheese, reason: reason}
    end)
    |> Enum.uniq_by(& &1.cheese.name)
  end
end
```

The model returns names and reasons in JSON. I look those names up in my actual catalog and return the corresponding structs, so the rest of the notebook doesn't have to trust arbitrary cheese-shaped text. `Map.fetch!/2` also fails loudly if the model invents a cheese that isn't in the catalog. Given my earlier concern about poorly paired cheeses and mysterious exceptions, I rather like that.

```elixir
CheeseRecommender.recommend(cheesy_goodness, "salty pretzels")
```

This is closer to what I wanted from a pairing recommender. It can explain why a particular cheese would balance a salty pretzel, rather than merely announcing which pairing string happens to sit nearest the word `salty`. Whether I agree with its taste is another matter. That sounds like an excellent excuse to buy some cheese.

The three approaches now have different jobs: the original filter finds literal text, embeddings retrieve related text, and the recommender reasons across the small catalog. I started out expecting one of them to replace the others. It turns out the more useful result was figuring out what question each one answers.
