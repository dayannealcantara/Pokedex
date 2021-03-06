import React, { useState, useEffect, useCallback } from 'react';
import PokemonCard from '../../components/PokemonCard';
import Header from '../../components/Header';
import api from '../../services/api';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Container,
  Wrapper,
  Fieldset,
  Legend,
  LogoBuscar,
  LogoFavoritos,
  TextFavorito,
  Buscar,
  ContainerMenu,
  SearchContainer,
  PokemonsContainer,
} from './styles';
import Logopesquisar from '../../imagens/pesqui.png';
import Logofavoritos from '../../imagens/curtir.png';
import Error from '../../components/Helper/Error';
import useDebounce from '../../hooks/useDebounce';

function ListPokemon() {
  const NUMBER_POKEMONS = 25;
  const NUMBER_MAX_POKEMONS_API = 750;
  const [pokemons, setPokemons] = useState([]);
  const [pokemonValueInput, setPokemonValueInput] = useState('');
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const debounce = useDebounce(setPokemonSearch, 700);
  const [pokemonsOffsetApi, setPokemonsOffsetApi] = useState(NUMBER_POKEMONS);

  const handleSearchPokemons = useCallback(async () => {
    const response = await api.get(`/pokemon?limit=${NUMBER_MAX_POKEMONS_API}`);

    setPokemonSearch(pokemonSearch.toLocaleLowerCase());

    const pokemonsSearch = response.data.results.filter(({ name }) =>
      name.includes(pokemonSearch),
    );
    setPokemons(pokemonsSearch);
  }, [pokemonSearch]);

  const handlePokemonsListDefault = useCallback(async () => {
    const response = await api.get('/pokemon', {
      params: {
        limit: NUMBER_POKEMONS,
      },
    });
    setPokemons(response.data.results);
  }, []);

  const handleChangeSearch = useCallback(e => {
    setPokemonValueInput(e.target.value)
    debounce(e.target.value)
  },[] );
  

  const PlusPokemons =async () => {
    if (pokemonsOffsetApi >= NUMBER_MAX_POKEMONS_API) {
      setHasMore(false)
      return;
    }
  
      const response = await api.get(`/pokemon`, {
        params: {
          limit: NUMBER_POKEMONS,
          offset: pokemonsOffsetApi,
        },
      });
      setPokemons(state => [...state, ...response.data.results]);
    setPokemonsOffsetApi((pokemonsOffsetApi + 10));
  
  };

  useEffect(() => {
    const isSearch = pokemonSearch.length >= 2;

    if (isSearch) handleSearchPokemons();
    else handlePokemonsListDefault();
  }, [pokemonSearch, handlePokemonsListDefault, handleSearchPokemons]);

  return (
    <>
      <Header />
      <Container>
        <Wrapper>
          <SearchContainer>
            <Fieldset>
              <Legend>Buscar</Legend>
              <Buscar
                type="text"
                placeholder={'Busque seu Pokemon'}
                value={pokemonValueInput}
                onChange={handleChangeSearch}
              />
              <LogoBuscar src={Logopesquisar} alt="logo de pesquisa" />
            </Fieldset>
            <ContainerMenu to="meus-favoritos">
              <LogoFavoritos src={Logofavoritos} alt="logo favoritos" />
              <TextFavorito>Meus Favoritos</TextFavorito>
            </ContainerMenu>
          </SearchContainer>
          {pokemonSearch.length >= 2 && pokemons.length === 0 ? (
            <Error />
          ) : (
            <div
              id="scrollableDiv"
              style={{
                width: '100%',
              }}
            >
              <InfiniteScroll
                dataLength={pokemonsOffsetApi}
                next={PlusPokemons}
                hasMore={hasMore}
                loader={hasMore === <h4>Loading...</h4>}
              >
            <PokemonsContainer>
              {pokemons.map(pokemon => (
                <PokemonCard key={pokemon.name} name={pokemon.name} />
              ))}
            </PokemonsContainer>
               </InfiniteScroll>
            </div>
          )}
        </Wrapper>
      </Container>
    </>
  );
}

export default ListPokemon;
