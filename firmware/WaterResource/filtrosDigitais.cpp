/*
By, Santos CRB Soft, 2018
Version 1.0
*/
#include "filtrosDigitais.h"
//---------- Construtor
FPB::FPB()
{
  _isFirstRun = true;
  _alpha = 0.7;

}
//---------- Destrutor
FPB::~FPB()
{

}
//----------------------------------------------------------
void FPB::setAlpha(double alpha){
  _alpha = alpha;
}
//----------------------------------------------------------
double FPB::retValue(double value){
  float calc;
  if(_isFirstRun==true){
	_prevX= value;
	_isFirstRun = false;
  }
  calc = _alpha*_prevX + (1- _alpha)*value;
  _prevX = calc;
  return(calc);
}
//----------------------------------------------------------
//----------------------------------------------------------
MediaMovel::MediaMovel()
{
  _isFirstRun = true;
  _dimension = 10;
  _ponteiro = 0;
  for(byte i=0;i<255;i++){
    _vetor[i]=0;	  
  }
}
//----------------------------------------------------------
MediaMovel::~MediaMovel()
{
  
}
//----------------------------------------------------------
void MediaMovel::setDimension(byte dimension)
{
  _dimension = dimension;  
}
//----------------------------------------------------------
double MediaMovel::retValue(double value)
{
  double media;
  if(_isFirstRun){
    _isFirstRun = false;	  
    for(byte i = 0;i<_dimension;i++){
	  _vetor[i] = value;
    }
	media = value;
  }
  else{
    _vetor[_ponteiro++]=value;
	if(_ponteiro==_dimension){
	  _ponteiro = 0;	
	}
	media = 0;
	for(byte i=0;i<_dimension;i++){
	  media+=_vetor[i];	
	}
	media/=_dimension;
  }  
  return(media);
}